import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AUTHOR_STATS } from '../data/authorData';

gsap.registerPlugin(ScrollTrigger);

const MARQUEE_ROW_ONE = [
  'Author',
  'Writer',
  'Director',
  'Author',
  'Writer',
  'Director',
  'Author',
  'Writer',
  'Director',
];

const MARQUEE_ROW_TWO = [
  'Writer',
  'Director',
  'Author',
  'Writer',
  'Director',
  'Author',
  'Writer',
  'Director',
  'Author',
];

export function AboutAndMarquee() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const portraitImgRef = useRef<HTMLImageElement>(null);
  const bioCopyRef = useRef<HTMLDivElement>(null);
  const marqueeWrapRef = useRef<HTMLDivElement>(null);
  const rowOneRef = useRef<HTMLDivElement>(null);
  const rowTwoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      if (portraitRef.current) {
        gsap.from(portraitRef.current, {
          opacity: 0,
          y: 28,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: portraitRef.current,
            start: 'top 82%',
            once: true,
            refreshPriority: -1,
          },
        });
      }

      if (portraitRef.current && portraitImgRef.current) {
        gsap.fromTo(
          portraitImgRef.current,
          { scale: 1.09, yPercent: -4 },
          {
            scale: 1.01,
            yPercent: 4,
            ease: 'none',
            scrollTrigger: {
              trigger: portraitRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
              invalidateOnRefresh: true,
              refreshPriority: -1,
            },
          }
        );
      }

      if (bioCopyRef.current) {
        gsap.from(bioCopyRef.current.children, {
          opacity: 0,
          y: 22,
          duration: 0.85,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: bioCopyRef.current,
            start: 'top 82%',
            once: true,
            refreshPriority: -1,
          },
        });
      }

      if (marqueeWrapRef.current && rowOneRef.current && rowTwoRef.current) {
        const updateMarquee = (progress: number) => {
          const travel = window.innerWidth < 768 ? 320 : 640;
          const row1X = -40 - progress * travel;
          const row2X = -40 - travel + progress * travel;
          if (rowOneRef.current) {
            rowOneRef.current.style.transform = `translate3d(${row1X}px, 0, 0)`;
          }
          if (rowTwoRef.current) {
            rowTwoRef.current.style.transform = `translate3d(${row2X}px, 0, 0)`;
          }
        };

        updateMarquee(0);

        ScrollTrigger.create({
          trigger: marqueeWrapRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
          refreshPriority: -2,
          onUpdate: (self) => {
            updateMarquee(self.progress);
          },
        });
      }
    }, sectionRef);

    // Refresh after web fonts settle so ScrollTrigger positions stay exact
    document.fonts?.ready?.then(() => {
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative overflow-x-clip">
      {/* 3. ABOUT THE AUTHOR SPLIT SECTION */}
      <section
        id="about"
        aria-labelledby="about-heading"
        className="relative z-10 w-full"
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left: Diane's Portrait */}
          <div
            ref={portraitRef}
            className="lg:col-span-5 relative min-h-[380px] sm:min-h-[480px] lg:min-h-[640px] overflow-hidden"
          >
            <img
              ref={portraitImgRef}
              src="/assets/extracted/diane-portrait.png"
              alt="Portrait of Diane Taveau, author, actor and theatre director"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top will-change-transform"
            />
          </div>

          {/* Right: Biography Copy cleanly over the theatre stage */}
          <div className="lg:col-span-7 lg:mt-16 flex items-center px-6 py-14 sm:px-12 sm:py-16 lg:px-20 lg:py-20">
            <div ref={bioCopyRef} className="max-w-xl space-y-6">
              <div>
                <p className="text-xs tracking-[0.22em] uppercase text-[#C99D38] font-medium mb-3">
                  About the Author
                </p>
                <h2
                  id="about-heading"
                  className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] text-white leading-[1.14]"
                >
                  Writer, actor and director, creating experiences, not just performances.
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-[15px] text-white leading-relaxed">
                <p>
                  Diane Taveau is a writer, actor and director. She brings experience from
                  the stage, the rehearsal room and the classroom to her books and creative
                  work.
                </p>
                <p>
                  Her work spans theatre, writing and directing, with a focus on collaboration
                  and helping people find their voice.
                </p>
              </div>

              {/* Four Stats */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-5 border-t border-white/10">
                {AUTHOR_STATS.map((stat) => (
                  <div key={stat.label} className="space-y-1.5">
                    <div className="text-3xl sm:text-4xl font-semibold text-white tabular-nums tracking-tight">
                      {stat.value}
                    </div>
                    <p className="text-xs text-white leading-snug">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERSIZED AUTHOR / WRITER / DIRECTOR OPPOSING MARQUEE */}
      <section
        ref={marqueeWrapRef}
        aria-label="Creative disciplines"
        className="relative z-10 w-full py-14 sm:py-20 overflow-hidden select-none"
      >
        <div className="space-y-4 sm:space-y-6">
          {/* Row 1: scrolls horizontally left on scroll */}
          <div
            ref={rowOneRef}
            className="flex items-center gap-8 sm:gap-12 w-max will-change-transform"
          >
            {MARQUEE_ROW_ONE.map((word, idx) => (
              <div key={`r1-${idx}`} className="flex items-center gap-8 sm:gap-12 shrink-0">
                <span className="font-serif text-5xl sm:text-7xl lg:text-[6.25rem] text-white tracking-tight leading-none">
                  {word}
                </span>
                <img
                  src="/assets/aistudio/image_29_d02b9c95.png"
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  className="w-16 sm:w-24 lg:w-28 h-auto object-contain opacity-30 invert shrink-0"
                />
              </div>
            ))}
          </div>

          {/* Row 2: scrolls horizontally right in the opposite direction on scroll */}
          <div
            ref={rowTwoRef}
            className="flex items-center gap-8 sm:gap-12 w-max will-change-transform"
          >
            {MARQUEE_ROW_TWO.map((word, idx) => (
              <div key={`r2-${idx}`} className="flex items-center gap-8 sm:gap-12 shrink-0">
                <span className="font-serif text-5xl sm:text-7xl lg:text-[6.25rem] text-white tracking-tight leading-none">
                  {word}
                </span>
                <img
                  src="/assets/aistudio/image_29_d02b9c95.png"
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  className="w-16 sm:w-24 lg:w-28 h-auto object-contain opacity-30 invert shrink-0"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
