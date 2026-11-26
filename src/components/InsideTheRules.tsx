import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { THEATRE_RULES } from '../data/authorData';

gsap.registerPlugin(ScrollTrigger);

const TOP_BULBS = Array.from({ length: 14 });
const SIDE_BULBS = Array.from({ length: 7 });

export function InsideTheRules() {
  const panelRef = useRef<HTMLDivElement>(null);
  const rulesListRef = useRef<HTMLOListElement>(null);
  const bulbRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [highlightedRule, setHighlightedRule] = useState<number | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const applyBulbState = (el: HTMLSpanElement, isOn: boolean) => {
      if (isOn) {
        el.style.opacity = '1';
        el.style.transform = 'scale(1)';
        el.style.backgroundColor = '#FFF8D6';
        el.style.boxShadow =
          '0 0 10px 3px rgba(253, 210, 74, 0.95), 0 0 20px 6px rgba(249, 189, 11, 0.55)';
      } else {
        el.style.opacity = '0.32';
        el.style.transform = 'scale(0.84)';
        el.style.backgroundColor = '#5E420E';
        el.style.boxShadow = '0 0 2px 0 rgba(249, 189, 11, 0.12)';
      }
    };

    if (prefersReduced) {
      bulbRefs.current.forEach((el) => {
        if (el) applyBulbState(el, true);
      });
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;

    const ctx = gsap.context(() => {
      gsap.from(panel, {
        opacity: 0,
        y: 28,
        duration: 0.85,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: panel,
          start: 'top 84%',
          once: true,
          refreshPriority: -3,
        },
      });

      // Scroll-driven on/off chase across Top, Left, and Right marquee bulbs
      const updateBulbsOnScroll = (progress: number) => {
        const step = Math.floor(progress * 18); // switches state smoothly 18 times as you scroll
        bulbRefs.current.forEach((el, index) => {
          if (!el) return;
          const isOn = (index + step) % 2 === 0;
          applyBulbState(el, isOn);
        });
      };

      updateBulbsOnScroll(0);

      ScrollTrigger.create({
        trigger: panel,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
        refreshPriority: -3,
        onUpdate: (self) => {
          updateBulbsOnScroll(self.progress);
        },
      });
    }, panelRef);

    return () => ctx.revert();
  }, []);

  const handleFocusRules = () => {
    rulesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedRule(0);
    window.setTimeout(() => setHighlightedRule(null), 2200);
  };

  // Bulb index offsets: Left (0..6), Top (7..20), Right (21..27)
  const setBulbRef = (globalIndex: number) => (el: HTMLSpanElement | null) => {
    bulbRefs.current[globalIndex] = el;
  };

  return (
    <section
      id="inside-the-rules"
      aria-labelledby="inside-rules-heading"
      className="relative py-10 sm:py-16 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-16 overflow-x-clip"
    >
      <div
        ref={panelRef}
        className="relative z-10 max-w-6xl mx-auto overflow-hidden rounded-sm border-[8px] sm:border-[10px] border-[#C9952C] bg-[#160410] shadow-[0_30px_80px_rgba(0,0,0,0.85)]"
      >
        {/* Clean borderless theatre auditorium artwork background */}
        <img
          src="/assets/extracted/theatre-auditorium-inner.jpg"
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Measured crimson/dark contrast scrim for WCAG AA legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#1a050b]/80 via-[#180612]/68 to-[#0b0614]/82"
        />

        {/* TOP MARQUEE BULBS (Frame 4 placement along top edge) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 sm:inset-x-10 top-1 sm:top-1.5 z-20 flex items-center justify-between"
        >
          {TOP_BULBS.map((_, i) => (
            <span
              key={`top-${i}`}
              ref={setBulbRef(SIDE_BULBS.length + i)}
              className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full transition-[opacity,transform,background-color,box-shadow] duration-150"
            />
          ))}
        </div>

        {/* LEFT MARQUEE BULBS (Frame 4 placement along left vertical edge) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1 sm:left-1.5 inset-y-8 sm:inset-y-10 z-20 flex flex-col items-center justify-between"
        >
          {SIDE_BULBS.map((_, i) => (
            <span
              key={`left-${i}`}
              ref={setBulbRef(SIDE_BULBS.length - 1 - i)}
              className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full transition-[opacity,transform,background-color,box-shadow] duration-150"
            />
          ))}
        </div>

        {/* RIGHT MARQUEE BULBS (Frame 4 placement along right vertical edge) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-1 sm:right-1.5 inset-y-8 sm:inset-y-10 z-20 flex flex-col items-center justify-between"
        >
          {SIDE_BULBS.map((_, i) => (
            <span
              key={`right-${i}`}
              ref={setBulbRef(SIDE_BULBS.length + TOP_BULBS.length + i)}
              className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full transition-[opacity,transform,background-color,box-shadow] duration-150"
            />
          ))}
        </div>

        {/* Two-column editorial interior */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 px-8 py-12 sm:px-14 sm:py-16 lg:px-20 lg:py-16 items-center">
          {/* Left Column: Intro & Quote */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs tracking-[0.22em] uppercase text-[#C99D38] font-medium mb-3">
                Inside The Rules
              </p>
              <h2
                id="inside-rules-heading"
                className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] text-white leading-[1.12]"
              >
                Five Rules From The Rehearsal Room, For Any Room You Love.
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-[15px] text-white leading-relaxed">
              <p>
                Diane’s five theatre rules are for anyone who wants to do their best work
                while showing up for the people around them.
              </p>
              <p>
                What begins onstage can help you collaborate, practise and make good work
                anywhere.
              </p>
            </div>

            <blockquote className="py-3 border-y border-white/15">
              <p className="font-serif italic text-lg sm:text-xl text-white">
                “Take what you like and leave the rest.”
              </p>
            </blockquote>

            <button
              type="button"
              onClick={handleFocusRules}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F9BD0B] hover:bg-[#ffd03b] text-[#111111] font-semibold text-xs sm:text-sm tracking-wide transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
            >
              See the Five Rules
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Five Numbered Rules */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <h3 className="font-sans text-xl sm:text-2xl font-bold text-white tracking-tight">
                The Rules
              </h3>
              <p className="text-xs sm:text-sm text-white mt-1">
                Tear this page out and tape it to the dressing-room mirror.
              </p>
            </div>

            <ol
              ref={rulesListRef}
              className="divide-y divide-white/15 border-t border-b border-white/15"
            >
              {THEATRE_RULES.map((rule, idx) => (
                <li
                  key={rule}
                  className={`flex items-center gap-4 sm:gap-5 py-4 transition-colors duration-300 ${
                    highlightedRule === idx ? 'bg-white/10 -mx-3 px-3 rounded' : ''
                  }`}
                >
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#F9BD0B] text-[#111111] font-bold text-sm tabular-nums flex items-center justify-center shrink-0 shadow-sm">
                    {idx + 1}
                  </span>
                  <span className="text-sm sm:text-base font-medium text-white leading-snug">
                    {rule}
                  </span>
                </li>
              ))}
            </ol>

            <p className="text-xs sm:text-sm text-white pt-1">
              From the rehearsal room to wherever life takes you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
