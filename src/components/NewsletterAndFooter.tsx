import { FormEvent, useState } from 'react';
import { Check } from 'lucide-react';
import { BOOKS, BookItem } from '../data/authorData';

interface SiteFooterProps {
  onSelectBook: (book: BookItem) => void;
}

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!isValidEmail) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('dt_mailing_list') || '[]') as string[];
      if (!existing.includes(trimmed.toLowerCase())) {
        localStorage.setItem(
          'dt_mailing_list',
          JSON.stringify([...existing, trimmed.toLowerCase()])
        );
      }
    } catch {
      // Ignore storage quota errors in private browsing
    }

    setStatus('success');
    setMessage('You’re on the list — look out for book news and stage dispatches.');
    setEmail('');
  };

  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-heading"
      className="relative py-20 sm:py-28 lg:py-36 px-4 overflow-hidden"
    >
      {/* Gentle bottom fade into the solid black footer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-black z-0"
      />

      {/* Signup content */}
      <div className="relative z-20 max-w-xl mx-auto text-center space-y-4">
          <p className="text-xs tracking-[0.22em] uppercase text-[#C99D38] font-medium">
            From The Wings
          </p>
          <h2
            id="newsletter-heading"
            className="font-serif text-3xl sm:text-5xl text-white leading-[1.12]"
          >
            Book News, Premieres And The Odd Rule.
          </h2>
          <p className="text-sm sm:text-[15px] text-white max-w-md mx-auto leading-relaxed">
            Join Diane’s mailing list for news about books, shows and what’s happening next.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="pt-4 max-w-md mx-auto"
          >
            <div className="flex items-center p-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 shadow-2xl focus-within:border-[#F9BD0B] transition-colors">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== 'idle') setStatus('idle');
                }}
                placeholder="Your email address"
                autoComplete="email"
                className="flex-1 min-w-0 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/80 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 sm:px-6 py-2.5 rounded-full bg-[#F9BD0B] hover:bg-[#ffd03b] text-[#111111] font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
              >
                Join the List
              </button>
            </div>

            {status === 'error' && (
              <p role="alert" className="mt-3 text-xs text-amber-300 font-medium">
                {message}
              </p>
            )}
            {status === 'success' && (
              <p
                role="status"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#F9BD0B] font-medium"
              >
                <Check className="w-4 h-4 shrink-0" />
                {message}
              </p>
            )}
          </form>
        </div>
      </section>
  );
}

export function SiteFooter({ onSelectBook }: SiteFooterProps) {
  const handleWatchReel = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
      <footer
        id="contact"
        className="relative z-20 bg-black border-t border-white/15 pt-16 pb-10 px-4 sm:px-8 lg:px-16"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-white/10">
            {/* Brand Lockup */}
            <div className="lg:col-span-4 space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-lg bg-[#161616] border border-white/10 flex items-center justify-center font-sans font-bold text-sm text-white tracking-wider shrink-0">
                  DT
                </div>
                <div>
                  <div className="font-sans text-base font-semibold text-white leading-tight">
                    Diane Taveau
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Author · Writer · Director
                  </div>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                Books, plays and lessons from a life in the theatre.
              </p>
            </div>

            {/* Books Column */}
            <div className="lg:col-span-3 space-y-3.5">
              <h3 className="font-serif text-xs tracking-[0.18em] uppercase text-[#C99D38]">
                Books
              </h3>
              <ul className="space-y-2.5 text-sm text-zinc-300">
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectBook(BOOKS[0])}
                    className="hover:text-white transition-colors text-left"
                  >
                    The Rules
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectBook(BOOKS[1])}
                    className="hover:text-white transition-colors text-left"
                  >
                    School Edition
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectBook(BOOKS[2])}
                    className="hover:text-white transition-colors text-left"
                  >
                    The Snail and the Sloth
                  </button>
                </li>
              </ul>
            </div>

            {/* Explore Column */}
            <div className="lg:col-span-3 space-y-3.5">
              <h3 className="font-serif text-xs tracking-[0.18em] uppercase text-[#C99D38]">
                Explore
              </h3>
              <ul className="space-y-2.5 text-sm text-zinc-300">
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    About Diane
                  </a>
                </li>
                <li>
                  <a href="#stage-work" className="hover:text-white transition-colors">
                    Stage Work
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleWatchReel}
                    className="hover:text-white transition-colors text-left"
                  >
                    Watch the Reel
                  </button>
                </li>
                <li>
                  <a href="#newsletter" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="lg:col-span-2 space-y-3.5">
              <h3 className="font-serif text-xs tracking-[0.18em] uppercase text-[#C99D38]">
                Contact
              </h3>
              <div className="space-y-1.5 text-sm">
                <p className="text-zinc-400">Email Diane</p>
                <a
                  href="mailto:taveaudiane@gmail.com"
                  className="block font-semibold text-white hover:text-[#F9BD0B] transition-colors break-all"
                >
                  taveaudiane@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <p>© Diane Taveau. All rights reserved.</p>
            <p>Any day on the stage is a good day.</p>
          </div>
        </div>
      </footer>
  );
}
