import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Play } from 'lucide-react';
import { BOOKS, BookItem, SCHOOL_HIGHLIGHTS } from '../data/authorData';

gsap.registerPlugin(ScrollTrigger);

interface SchoolEditionProps {
  onOpenSchoolOrder: (book: BookItem) => void;
}

export function SchoolEdition({ onOpenSchoolOrder }: SchoolEditionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideTwoRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  const schoolBook = BOOKS.find((b) => b.id === 'school') || BOOKS[1];

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      if (copyRef.current) {
        gsap.from(copyRef.current.children, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: copyRef.current,
            start: 'top 84%',
            once: true,
            refreshPriority: -4,
          },
        });
      }

      if (mediaRef.current) {
        gsap.from(mediaRef.current, {
          opacity: 0,
          y: 24,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: mediaRef.current,
            start: 'top 84%',
            once: true,
            refreshPriority: -4,
          },
        });
      }

      // Desktop: pinned horizontal scroll transition from School Edition -> Stage Work (2nd image)
      mm.add('(min-width: 1024px)', () => {
        const viewport = viewportRef.current;
        const track = trackRef.current;
        if (!viewport || !track) return;

        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: viewport,
            start: 'top top',
            end: () => `+=${Math.round(window.innerWidth * 1.15)}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: -4,
          },
        });
      });

      // Mobile / Tablet: smooth horizontal slide-in on scroll without clipping tall stacked content
      mm.add('(max-width: 1023px)', () => {
        const slideTwo = slideTwoRef.current;
        if (!slideTwo) return;

        gsap.fromTo(
          slideTwo,
          { x: 48, opacity: 0.15 },
          {
            x: 0,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: slideTwo,
              start: 'top 88%',
              end: 'top 35%',
              scrub: 0.5,
              invalidateOnRefresh: true,
              refreshPriority: -4,
            },
          }
        );
      });
    }, sectionRef);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  const handleWatchReel = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="school-edition"
      aria-labelledby="school-edition-heading"
      className="relative pt-16 sm:pt-28 lg:pt-36 pb-8 lg:pb-0 overflow-x-clip"
    >
      {/* Pinned horizontal viewport on desktop; stacked flow on mobile/tablet */}
      <div
        ref={viewportRef}
        className="relative z-10 w-full lg:h-screen lg:pt-12 lg:flex lg:items-center lg:overflow-hidden"
      >
        <div
          ref={trackRef}
          className="relative z-10 flex flex-col lg:flex-row lg:w-[200vw] lg:flex-nowrap gap-16 sm:gap-24 lg:gap-0 will-change-transform"
        >
          {/* SLIDE 1: SCHOOL EDITION */}
          <div className="w-full lg:w-screen lg:shrink-0 px-5 sm:px-10 lg:px-14 flex items-center">
            <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left: Drama Teachers & Student Casts Copy */}
              <div ref={copyRef} className="lg:col-span-5 space-y-6 sm:space-y-7">
                <div>
                  <p className="text-xs sm:text-sm tracking-[0.22em] uppercase text-[#C99D38] font-semibold mb-3">
                    School Edition
                  </p>
                  <h2
                    id="school-edition-heading"
                    className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-[2.9rem] text-white leading-[1.12]"
                  >
                    A Backstage Handbook For Drama Teachers And Student Casts.
                  </h2>
                </div>

                <p className="text-base sm:text-lg lg:text-[1.2rem] text-white leading-relaxed">
                  The School Edition gives theatre teachers and students practical ways to build
                  confidence, prepare for a show and work together.
                </p>

                <div className="space-y-4 pt-1">
                  {SCHOOL_HIGHLIGHTS.map((item) => (
                    <div key={item.title} className="space-y-1">
                      <h3 className="font-sans text-base sm:text-lg lg:text-[1.15rem] font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base lg:text-[1.05rem] text-white leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenSchoolOrder(schoolBook)}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#F9BD0B] hover:bg-[#ffd03b] text-[#111111] font-semibold text-sm sm:text-base tracking-wide transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
                  >
                    Bring It to Your School
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right: Cast Photo with Overlapping Navy School Edition Cover */}
              <div
                ref={mediaRef}
                className="lg:col-span-7 relative pb-14 sm:pb-16 lg:pl-6"
              >
                <div className="relative overflow-hidden rounded-sm shadow-[0_28px_70px_rgba(0,0,0,0.92)] w-full aspect-[16/13] lg:aspect-auto lg:h-[73vh] lg:max-h-[760px]">
                  <img
                    src="/assets/aistudio/Rectangle_10__1__27ac9fda.png"
                    alt="Diane Taveau and fellow cast members in blue stage suits in front of a red theatre curtain"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Navy School Edition Cover overlapping lower-left edge */}
                <div className="absolute left-2 sm:left-4 lg:left-0 bottom-0 w-36 sm:w-48 lg:w-52 xl:w-56 z-10 pointer-events-none">
                  <img
                    src="/assets/extracted/book-school-edition.png"
                    alt="The Rules: School Edition cover"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-contain drop-shadow-[0_24px_38px_rgba(0,0,0,0.92)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 2: STAGE WORK (Revealed on Horizontal Scroll with 2nd Image) */}
          <div
            ref={slideTwoRef}
            id="stage-work"
            aria-labelledby="stage-work-heading"
            className="w-full lg:w-screen lg:shrink-0 px-5 sm:px-10 lg:px-14 flex items-center"
          >
            <div className="w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left: 2nd Stage Performance Photo (matched size to Slide 1 image) */}
              <div className="lg:col-span-7 lg:pr-6">
                <div className="relative overflow-hidden rounded-sm shadow-[0_28px_70px_rgba(0,0,0,0.92)] bg-[#0b0b0b] w-full aspect-[16/13] lg:aspect-auto lg:h-[73vh] lg:max-h-[760px]">
                  <img
                    src="/assets/aistudio/image_4efa281f.png"
                    alt="Diane Taveau performing onstage seated beside a vintage desk and radio"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Right: STAGE WORK Copy + Watch the Reel Yellow Button */}
              <div className="lg:col-span-5 space-y-7 sm:space-y-8">
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm tracking-[0.22em] uppercase text-[#C99D38] font-semibold">
                    STAGE WORK
                  </p>
                  <h2
                    id="stage-work-heading"
                    className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] xl:text-[2.95rem] text-white leading-[1.12]"
                  >
                    On stage now, and what’s next.
                  </h2>
                  <p className="text-base sm:text-lg lg:text-[1.2rem] text-white leading-relaxed max-w-xl">
                    Diane’s acting career grew out of the rehearsal room. Here’s what she’s
                    working on now.
                  </p>
                </div>

                <div className="space-y-6 pt-3 border-t border-white/15">
                  <div className="space-y-1.5">
                    <p className="text-xs sm:text-[13px] tracking-[0.2em] uppercase text-[#C99D38] font-semibold">
                      CURRENTLY DIRECTING
                    </p>
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-[2.1rem] text-white leading-snug">
                      The Last 5 Years
                    </h3>
                    <p className="text-sm sm:text-base lg:text-[1.08rem] text-white leading-relaxed">
                      Diane is in the director’s chair for this production.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-5 border-t border-white/15">
                    <p className="text-xs sm:text-[13px] tracking-[0.2em] uppercase text-[#C99D38] font-semibold">
                      PREMIERE
                    </p>
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-[2.1rem] text-white leading-snug">
                      The Dynamo Club
                    </h3>
                    <p className="text-sm sm:text-base lg:text-[1.08rem] text-white leading-relaxed">
                      A new play from Diane Taveau.
                    </p>
                  </div>
                </div>

                {/* Yellow "Watch the reel / Theatre work" button matching reference */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleWatchReel}
                    className="inline-flex items-center gap-4 pl-4 pr-9 py-3.5 rounded-2xl bg-[#F9BD0B] hover:bg-[#ffd03b] text-[#161411] shadow-[0_14px_34px_rgba(249,189,11,0.2)] transition-colors focus-visible:outline-2 focus-visible:outline-white group"
                  >
                    <span className="w-12 h-12 rounded-full bg-[#1C1914] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                      <Play className="w-4 h-4 text-[#E5E5E5] fill-[#E5E5E5] ml-0.5" />
                    </span>
                    <span className="flex flex-col items-start text-left">
                      <span className="text-lg sm:text-[19px] font-bold leading-tight tracking-tight text-[#161411]">
                        Watch the reel
                      </span>
                      <span className="text-sm font-normal leading-tight text-[#161411]/85 mt-0.5">
                        Theatre work
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
