import { ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { BOOKS, BookItem } from '../data/authorData';

gsap.registerPlugin(ScrollTrigger);

interface HeroAndBooksSceneProps {
  onSelectBook: (book: BookItem) => void;
  children?: ReactNode;
}

interface CoverRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const HERO_SCRUB_VIDEO_SRC = '/assets/extracted/hero-reveal-scrub.mp4';
const HERO_POSTER_SRC = '/assets/extracted/hero-reveal-poster.jpg';
const HERO_FINAL_IMAGE_SRC = '/assets/extracted/hero-reveal-final.jpg';
const STAGE_THREE_PATCH_SRC = '/assets/extracted/stage-three-patch.png';

const DEFAULT_VIDEO_W = 1280;
const DEFAULT_VIDEO_H = 720;

// Normalized coordinates in the 1280x720 held reveal frame (t = 9.50s), indexed by BOOKS order:
// [0] The Rules (center pedestal), [1] School Edition (right pedestal), [2] Snail & Sloth (left pedestal)
const STAGE_BOOK_NORMS: CoverRect[] = [
  { left: 0.42578, top: 0.23472, width: 0.14922, height: 0.41528 },
  { left: 0.63984, top: 0.33194, width: 0.15781, height: 0.42639 },
  { left: 0.19531, top: 0.33056, width: 0.16094, height: 0.42639 },
];

// Clean 3-pedestal stage patch removing all 3 baked-in books during takeoff
const STAGE_THREE_PATCH_NORMS: CoverRect = {
  left: 0.16875,
  top: 0.18333,
  width: 0.6625,
  height: 0.61667,
};

const HOLD_REVEAL_TIME_MAX = 9.5;

function getObjectCoverRect(
  container: CoverRect,
  mediaW: number,
  mediaH: number
): CoverRect {
  const containerRatio = container.width / Math.max(1, container.height);
  const mediaRatio = mediaW / Math.max(1, mediaH);
  let renderedW: number;
  let renderedH: number;

  if (containerRatio > mediaRatio) {
    renderedW = container.width;
    renderedH = container.width / mediaRatio;
  } else {
    renderedH = container.height;
    renderedW = container.height * mediaRatio;
  }

  return {
    left: container.left + (container.width - renderedW) / 2,
    top: container.top + (container.height - renderedH) / 2,
    width: renderedW,
    height: renderedH,
  };
}

function getNormRect(mediaRect: CoverRect, norms: CoverRect): CoverRect {
  return {
    left: mediaRect.left + mediaRect.width * norms.left,
    top: mediaRect.top + mediaRect.height * norms.top,
    width: mediaRect.width * norms.width,
    height: mediaRect.height * norms.height,
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function HeroAndBooksScene({ onSelectBook, children }: HeroAndBooksSceneProps) {
  const heroSectionRef = useRef<HTMLElement>(null);
  const heroStageRef = useRef<HTMLDivElement>(null);
  const booksSectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stagePatchRef = useRef<HTMLImageElement>(null);
  const floatingBookRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardSlotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardImgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  const heroScrimRef = useRef<HTMLDivElement>(null);
  const heroBodyGroupRef = useRef<HTMLDivElement>(null);
  const theatreBgWrapRef = useRef<HTMLDivElement>(null);
  const theatreBgImgRef = useRef<HTMLImageElement>(null);

  const [videoFailed, setVideoFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const getScrollDistances = useCallback(() => {
    const vh = window.innerHeight || 800;
    const isMobile = window.innerWidth < 768;
    const stageEl = heroStageRef.current;
    const stageH = stageEl ? Math.max(vh, stageEl.getBoundingClientRect().height) : vh;

    let cardBottomInBooks = isMobile ? 380 : 560;
    const booksEl = booksSectionRef.current;
    const slotEl = cardSlotRefs.current[0];
    if (booksEl && slotEl) {
      const booksRect = booksEl.getBoundingClientRect();
      const slotRect = slotEl.getBoundingClientRect();
      const measured = slotRect.bottom - booksRect.top;
      if (measured > 100) {
        cardBottomInBooks = measured;
      }
    }

    // Shorten overall scroll distance on mobile while keeping all 3 cards visible on landing
    const minHandoffForCard = cardBottomInBooks + (isMobile ? 40 : 96);
    const baseHandoff = Math.round(vh * (isMobile ? 0.48 : 0.78));
    const handoffDistance = clamp(
      Math.max(baseHandoff, minHandoffForCard),
      Math.round(vh * 0.46),
      Math.round(vh * 0.88)
    );

    // Exact 75% pin (push-in, curtain open, reveal hold) / 25% handoff to cards
    const pinDistance = Math.round(handoffDistance * 3);
    return {
      vh,
      stageH,
      isMobile,
      pinDistance,
      handoffDistance,
      totalDistance: pinDistance + handoffDistance,
    };
  }, []);

  useEffect(() => {
    const heroSection = heroSectionRef.current;
    const heroStage = heroStageRef.current;
    const video = videoRef.current;

    if (reducedMotion || videoFailed) {
      if (heroSection) {
        heroSection.style.height = 'auto';
      }
      cardImgRefs.current.forEach((img) => {
        if (img) img.style.opacity = '1';
      });
      floatingBookRefs.current.forEach((el) => {
        if (el) {
          el.style.opacity = '0';
          el.style.visibility = 'hidden';
        }
      });
      if (stagePatchRef.current) {
        stagePatchRef.current.style.opacity = '0';
        stagePatchRef.current.style.visibility = 'hidden';
      }
      return;
    }

    if (!heroSection || !heroStage || !video) return;

    let holdFrameTime = HOLD_REVEAL_TIME_MAX;
    let canRenderFrames =
      video.readyState >= 2 && Number.isFinite(video.duration) && video.duration > 0;
    if (Number.isFinite(video.duration) && video.duration > 0) {
      holdFrameTime = Math.min(
        Math.max(0.1, video.duration - 0.08),
        HOLD_REVEAL_TIME_MAX
      );
    }
    if (canRenderFrames) {
      video.pause();
    }

    let desiredVideoTime = 0;
    let lastAppliedSeek = -1;

    const applyVideoSeek = () => {
      if (!canRenderFrames || video.seeking) return;
      const clamped = clamp(desiredVideoTime, 0, holdFrameTime);
      if (Math.abs(clamped - lastAppliedSeek) < 0.008) return;
      lastAppliedSeek = clamped;
      if (!video.paused) video.pause();
      try {
        video.currentTime = clamped;
      } catch {
        setVideoFailed(true);
      }
    };

    const seekVideoTo = (targetTime: number) => {
      desiredVideoTime = clamp(targetTime, 0, holdFrameTime);
      applyVideoSeek();
    };

    const markVideoFrameReady = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        holdFrameTime = Math.min(
          Math.max(0.1, video.duration - 0.08),
          HOLD_REVEAL_TIME_MAX
        );
      }
      if (video.readyState >= 2) {
        canRenderFrames = true;
        video.pause();
        lastAppliedSeek = -1;
        applyVideoSeek();
      }
    };

    const onLoadedMetadata = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        holdFrameTime = Math.min(
          Math.max(0.1, video.duration - 0.08),
          HOLD_REVEAL_TIME_MAX
        );
        ScrollTrigger.refresh();
      }
      if (video.readyState >= 2) {
        markVideoFrameReady();
      }
    };

    const onSeeked = () => {
      if (!canRenderFrames) return;
      if (Math.abs(video.currentTime - desiredVideoTime) > 0.025) {
        lastAppliedSeek = -1;
        applyVideoSeek();
      }
    };

    const onVideoError = () => {
      setVideoFailed(true);
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('loadeddata', markVideoFrameReady);
    video.addEventListener('canplay', markVideoFrameReady);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onVideoError);

    const syncHeroHeight = () => {
      const { stageH, pinDistance } = getScrollDistances();
      heroSection.style.height = `${stageH + pinDistance}px`;
    };

    syncHeroHeight();

    const renderSequence = (p: number) => {
      const { isMobile } = getScrollDistances();
      const mediaW = video.videoWidth || DEFAULT_VIDEO_W;
      const mediaH = video.videoHeight || DEFAULT_VIDEO_H;

      // Scroll cue fades out gently once scrolling starts
      if (scrollCueRef.current) {
        scrollCueRef.current.style.opacity = String(clamp(1 - p * 12, 0, 1));
      }

      // Hero intro typography:
      // - Heading animates in smoothly on initial page load (p = 0)
      // - Body text & CTA buttons reveal smoothly on slow scroll (p: 0.015 -> 0.16)
      // - Entire intro overlay fades/lifts cleanly before curtains open to reveal books (p: 0.36 -> 0.50)
      let overlayOut = 1;
      if (heroOverlayRef.current && heroScrimRef.current) {
        overlayOut = 1 - easeInOutCubic(clamp((p - 0.36) / 0.14, 0, 1));
        heroOverlayRef.current.style.opacity = String(overlayOut);
        heroOverlayRef.current.style.transform = `translate3d(0, ${(1 - overlayOut) * -22}px, 0)`;
        heroOverlayRef.current.style.visibility = overlayOut <= 0.01 ? 'hidden' : 'visible';
        heroScrimRef.current.style.opacity = String(overlayOut);
      }

      if (heroBodyGroupRef.current) {
        const bodyReveal = easeInOutCubic(clamp((p - 0.015) / 0.145, 0, 1));
        heroBodyGroupRef.current.style.opacity = String(bodyReveal);
        heroBodyGroupRef.current.style.transform = `translate3d(0, ${(1 - bodyReveal) * 20}px, 0)`;
        heroBodyGroupRef.current.style.pointerEvents =
          bodyReveal > 0.2 && overlayOut > 0.2 ? 'auto' : 'none';
      }

      // 1. Slow push-in, curtain opening & reveal across the first ~70% of scroll
      const videoEndProgress = 0.70;
      const videoT = clamp(p / videoEndProgress, 0, 1);
      seekVideoTo(videoT * holdFrameTime);

      const stagePatch = stagePatchRef.current;
      if (!stagePatch) return;

      const stageLiveRect = heroStage.getBoundingClientRect();
      const stageMediaRect = getObjectCoverRect(stageLiveRect, mediaW, mediaH);

      // Align the clean 3-pedestal patch in heroStage-local coordinates
      const patchRect = getNormRect(stageMediaRect, STAGE_THREE_PATCH_NORMS);
      stagePatch.style.left = `${patchRect.left - stageLiveRect.left}px`;
      stagePatch.style.top = `${patchRect.top - stageLiveRect.top}px`;
      stagePatch.style.width = `${patchRect.width}px`;
      stagePatch.style.height = `${patchRect.height}px`;

      // Before reveal frame lock (p < 0.715): show pure scrubbed video, hide overlays & card covers
      if (p < 0.715) {
        stagePatch.style.opacity = '0';
        stagePatch.style.visibility = 'hidden';
        BOOKS.forEach((_, idx) => {
          const floatEl = floatingBookRefs.current[idx];
          const cardImg = cardImgRefs.current[idx];
          if (floatEl) {
            floatEl.style.opacity = '0';
            floatEl.style.visibility = 'hidden';
          }
          if (cardImg) {
            cardImg.style.opacity = '0';
          }
        });
        return;
      }

      // From p >= 0.715 onward: patch hides all 3 baked-in books; transparent covers take over
      stagePatch.style.opacity = '1';
      stagePatch.style.visibility = 'visible';

      // Slight theatrical stagger: center ("The Rules") leads, followed closely by School Edition & Snail and Sloth
      const staggerStarts = isMobile ? [0.75, 0.765, 0.78] : [0.75, 0.768, 0.785];
      const staggerEnds = isMobile ? [0.955, 0.98, 1.0] : [0.955, 0.98, 1.0];

      // Anchor takeoff origin at the stage's pinned position (top = 0)
      const launchStageContainer: CoverRect = {
        left: stageLiveRect.left,
        top: 0,
        width: stageLiveRect.width,
        height: stageLiveRect.height,
      };
      const launchMediaRect = getObjectCoverRect(launchStageContainer, mediaW, mediaH);

      BOOKS.forEach((_, idx) => {
        const floatEl = floatingBookRefs.current[idx];
        const cardImg = cardImgRefs.current[idx];
        if (!floatEl || !cardImg) return;

        const norms = STAGE_BOOK_NORMS[idx];
        const sStart = staggerStarts[idx];
        const sEnd = staggerEnds[idx];

        // Landed cleanly inside its matching card slot
        if (p >= sEnd - 0.001) {
          floatEl.style.opacity = '0';
          floatEl.style.visibility = 'hidden';
          cardImg.style.opacity = '1';
          return;
        }

        cardImg.style.opacity = '0';
        floatEl.style.opacity = '1';
        floatEl.style.visibility = 'visible';

        // Aligned on stage pedestal (0.715 -> sStart)
        if (p <= sStart) {
          const stageBookRect = getNormRect(stageMediaRect, norms);
          floatEl.style.left = `${stageBookRect.left}px`;
          floatEl.style.top = `${stageBookRect.top}px`;
          floatEl.style.width = `${stageBookRect.width}px`;
          floatEl.style.height = `${stageBookRect.height}px`;
          floatEl.style.transform = 'perspective(1100px) scale(1)';
          floatEl.style.zIndex = idx === 0 ? '43' : idx === 1 ? '42' : '41';
          return;
        }

        // Takeoff & travel from stage pedestal into matching card slot
        const flightU = clamp((p - sStart) / (sEnd - sStart), 0, 1);
        const easedU = easeInOutCubic(flightU);

        const startRect = getNormRect(launchMediaRect, norms);
        const endRect = cardImg.getBoundingClientRect();

        const liftArc = Math.sin(flightU * Math.PI);
        const curLeft = lerp(startRect.left, endRect.left, easedU);
        const curTop =
          lerp(startRect.top, endRect.top, easedU) -
          liftArc * (isMobile ? 16 : 36);
        const curW = lerp(startRect.width, endRect.width, easedU);
        const curH = lerp(startRect.height, endRect.height, easedU);
        const forwardScale = 1 + liftArc * (isMobile ? 0.09 : 0.16);

        floatEl.style.left = `${curLeft}px`;
        floatEl.style.top = `${curTop}px`;
        floatEl.style.width = `${curW}px`;
        floatEl.style.height = `${curH}px`;
        floatEl.style.transform = `perspective(1100px) scale(${forwardScale})`;
        floatEl.style.zIndex = idx === 0 ? '43' : idx === 1 ? '42' : '41';
      });
    };

    const seqState = { progress: 0 };

    const ctx = gsap.context(() => {
      // Initial stage banner entrance animation on load
      if (heroHeadingRef.current) {
        gsap.fromTo(
          heroHeadingRef.current,
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 1.05, ease: 'power3.out', delay: 0.1 }
        );
      }

      gsap.fromTo(
        video,
        { scale: 1.06 },
        { scale: 1, duration: 1.5, ease: 'power2.out' }
      );

      if (scrollCueRef.current) {
        gsap.fromTo(
          scrollCueRef.current,
          { y: 12 },
          { y: 0, duration: 0.9, ease: 'power2.out', delay: 0.45 }
        );
      }

      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: () => `+=${getScrollDistances().totalDistance}`,
          scrub: true,
          invalidateOnRefresh: true,
          onRefreshInit: syncHeroHeight,
        },
      });

      masterTimeline.to(seqState, {
        progress: 1,
        duration: 1,
        ease: 'none',
        onUpdate: () => renderSequence(seqState.progress),
      });

      const st = masterTimeline.scrollTrigger;
      renderSequence(st ? st.progress : 0);
    }, heroSection);

    const handleResize = () => {
      syncHeroHeight();
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('loadeddata', markVideoFrameReady);
      video.removeEventListener('canplay', markVideoFrameReady);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onVideoError);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      ctx.revert();
    };
  }, [reducedMotion, videoFailed, getScrollDistances]);

  // Pan the full vertical theatre stage image cleanly from top (golden arch) to bottom (wooden floor)
  // across The Books -> From The Wings inside the sticky viewport
  useEffect(() => {
    const wrap = theatreBgWrapRef.current;
    const img = theatreBgImgRef.current;
    if (!wrap || !img) return;

    const getPanDistance = () => {
      const vh = window.innerHeight || 800;
      const vw = window.innerWidth || 1280;
      const naturalW = img.naturalWidth || 2160;
      const naturalH = img.naturalHeight || 3840;
      const renderedH = Math.max(vh, vw * (naturalH / naturalW));
      return Math.max(0, renderedH - vh);
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(
        img,
        { y: 0 },
        {
          y: () => -getPanDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: wrap,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true,
            refreshPriority: -5,
          },
        }
      );
    }, wrap);

    const onImgLoad = () => ScrollTrigger.refresh();
    if (!img.complete) {
      img.addEventListener('load', onImgLoad);
    }

    return () => {
      img.removeEventListener('load', onImgLoad);
      ctx.revert();
    };
  }, []);

  return (
    <>
      {/* 1. FULL-SCREEN THEATRE HERO (sticky-pinned for first ~75%, scrolls up cleanly for handoff) */}
      <section
        id="hero"
        ref={heroSectionRef}
        aria-label="Diane Taveau Theatre Stage"
        className="relative w-full bg-black overflow-x-clip"
      >
        <div
          ref={heroStageRef}
          className="sticky top-0 w-full h-screen min-h-[520px] bg-black overflow-hidden select-none"
        >
          {reducedMotion || videoFailed ? (
            <img
              src={HERO_FINAL_IMAGE_SRC}
              alt="Theatre stage with red velvet curtains parted to reveal Diane Taveau's books"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <video
              ref={videoRef}
              src={HERO_SCRUB_VIDEO_SRC}
              poster={HERO_POSTER_SRC}
              muted
              playsInline
              preload="auto"
              aria-label="Slow theatre auditorium push-in and curtain opening revealing Diane Taveau's books"
              className="w-full h-full object-cover object-center"
            />
          )}

          {/* Clean stage patch hiding all 3 baked-in books during takeoff */}
          {!reducedMotion && !videoFailed && (
            <img
              ref={stagePatchRef}
              src={STAGE_THREE_PATCH_SRC}
              alt=""
              aria-hidden="true"
              style={{ opacity: 0, visibility: 'hidden' }}
              className="pointer-events-none absolute z-10 object-fill select-none"
            />
          )}

          {/* Subtle top/bottom theatrical vignette */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-transparent to-black/55"
          />

          {/* Soft readability scrim behind hero intro copy (fades out before books reveal) */}
          {!reducedMotion && !videoFailed && (
            <div
              ref={heroScrimRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-15 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.34)_55%,rgba(0,0,0,0.12)_100%)]"
            />
          )}

          {/* Hero Intro Overlay: heading on load, body + buttons revealed on slow scroll */}
          <div
            ref={heroOverlayRef}
            className={`pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-5 sm:px-8 text-center ${
              reducedMotion || videoFailed ? 'justify-end pb-12 sm:pb-16 bg-gradient-to-t from-black/85 via-black/40 to-transparent' : ''
            }`}
          >
            <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
              <h1
                ref={heroHeadingRef}
                className="font-serif text-3xl sm:text-5xl lg:text-[3.5rem] text-white leading-[1.1] tracking-tight drop-shadow-[0_6px_24px_rgba(0,0,0,0.85)] will-change-transform"
              >
                Lessons from the stage, written for every stage of life.
              </h1>

              <div
                ref={heroBodyGroupRef}
                style={
                  reducedMotion || videoFailed
                    ? undefined
                    : { opacity: 0, transform: 'translate3d(0, 20px, 0)', pointerEvents: 'none' }
                }
                className="space-y-6 sm:space-y-7 will-change-transform"
              >
                <p className="text-sm sm:text-base lg:text-[17px] text-white leading-relaxed max-w-2xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                  Diane Taveau has been acting since she was eight and writing plays since she
                  was ten. In <span className="italic">The Rules</span>, she shares the five
                  rules she sets with every cast and crew she directs, and why they work far
                  beyond the theatre.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
                  <a
                    href="#books"
                    className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-[#F9BD0B] hover:bg-[#ffd03b] text-[#111111] font-semibold text-xs sm:text-sm tracking-wide shadow-[0_12px_28px_rgba(0,0,0,0.55)] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
                  >
                    Explore the Books
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#about"
                    className="inline-flex items-center justify-center px-6 sm:px-7 py-3 rounded-full bg-black/65 hover:bg-white/15 border border-white/35 text-white font-medium text-xs sm:text-sm tracking-wide backdrop-blur-sm shadow-[0_12px_28px_rgba(0,0,0,0.5)] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
                  >
                    Meet Diane
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quiet Scroll Indicator */}
          {!reducedMotion && !videoFailed && (
            <div
              ref={scrollCueRef}
              className="pointer-events-none absolute inset-x-0 bottom-7 z-20 flex flex-col items-center gap-2 text-white/85"
            >
              <span className="text-[11px] uppercase tracking-[0.26em] font-medium drop-shadow">
                Scroll to Raise the Curtain
              </span>
              <ArrowDown className="w-4 h-4 text-[#F9BD0B] animate-bounce" />
            </div>
          )}
        </div>
      </section>

      {/* FLOATING BOOKS BRIDGE LAYER (spans above both Hero and Books without clipping) */}
      {!reducedMotion && !videoFailed && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 overflow-visible"
        >
          {BOOKS.map((book, idx) => (
            <div
              key={book.id}
              ref={(el) => {
                floatingBookRefs.current[idx] = el;
              }}
              style={{ opacity: 0, visibility: 'hidden' }}
              className="fixed will-change-transform origin-center"
            >
              <img
                src={book.coverSrc}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-fill drop-shadow-[0_26px_42px_rgba(0,0,0,0.88)]"
              />
            </div>
          ))}
        </div>
      )}

      {/* 2. STICKY THEATRE STAGE BACKDROP FROM THE BOOKS THROUGH FROM THE WINGS */}
      <div ref={theatreBgWrapRef} className="relative bg-black overflow-x-clip">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
        >
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            <img
              ref={theatreBgImgRef}
              src="/assets/aistudio/dark-theatre-with-seats-2160x3840_a8b81140.png"
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-auto min-h-full object-cover will-change-transform"
            />
            <div className="absolute inset-0 bg-black/65" />
          </div>
        </div>

        <div className="relative z-10">
          {/* THREE-COLUMN BOOKS SECTION */}
          <section
            id="books"
            ref={booksSectionRef}
            className="relative z-10 pt-14 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-8 lg:px-16"
          >
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <p className="text-xs tracking-[0.22em] uppercase text-[#C99D38] font-medium mb-3">
              The Books
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl text-white leading-[1.12] tracking-tight">
              For The Stage, The Classroom And Bedtime
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-8 lg:gap-14 items-start">
            {BOOKS.map((book, idx) => (
              <article
                key={book.id}
                className="flex flex-col items-start text-left group"
              >
                <div
                  ref={(el) => {
                    cardSlotRefs.current[idx] = el;
                  }}
                  className="relative w-full aspect-[253/413] max-w-[230px] mx-auto sm:mx-0 mb-4 sm:mb-6 flex items-end justify-center"
                >
                  <img
                    ref={(el) => {
                      cardImgRefs.current[idx] = el;
                    }}
                    src={book.coverSrc}
                    alt={`${book.title} book cover`}
                    referrerPolicy="no-referrer"
                    style={{ opacity: reducedMotion || videoFailed ? 1 : 0 }}
                    className="max-w-full max-h-full w-full h-auto object-contain transition-transform duration-300 group-hover:-translate-y-1.5 drop-shadow-[0_18px_32px_rgba(0,0,0,0.85)]"
                  />
                </div>

                <div className="w-full max-w-[260px] mx-auto sm:mx-0 flex flex-col flex-1">
                  <h3 className="font-serif text-[14px] sm:text-xl text-white leading-snug mb-1.5 sm:mb-2">
                    {book.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-white leading-relaxed mb-4 sm:mb-5 line-clamp-3 sm:line-clamp-none min-h-[2.8rem] sm:min-h-[2.75rem]">
                    {book.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectBook(book)}
                    className="inline-flex items-center justify-center px-3.5 sm:px-7 py-2 sm:py-2.5 rounded-full bg-[#F9BD0B] hover:bg-[#ffd03b] text-[#111111] font-semibold text-[11px] sm:text-xs tracking-wide transition-colors whitespace-nowrap shrink-0 self-start min-h-[38px] sm:min-h-[40px] focus-visible:outline-2 focus-visible:outline-white"
                  >
                    {book.ctaLabel}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
          {children}
        </div>
      </div>
    </>
  );
}
