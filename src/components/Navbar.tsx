import { useEffect, useState } from 'react';
import { Menu, ShoppingBag, UserRound, X } from 'lucide-react';

export interface AuthUser {
  name: string;
  email: string;
}

interface NavbarProps {
  cartCount: number;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onOpenCart: () => void;
}

const NAV_LINKS = [
  { label: 'Books', href: '#books' },
  { label: 'About', href: '#about' },
  { label: 'The Rules', href: '#inside-the-rules' },
  { label: 'School Edition', href: '#school-edition' },
  { label: 'Stage Work', href: '#stage-work' },
  { label: 'Contact', href: '#newsletter' },
];

export function Navbar({ cartCount, user, onOpenAuth, onOpenCart }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileOpen(false);
    if (href === '#stage-work' && window.innerWidth >= 1024) {
      e.preventDefault();
      const schoolSection = document.getElementById('school-edition');
      if (schoolSection) {
        const sectionTop = schoolSection.getBoundingClientRect().top + window.scrollY;
        const padTop = parseFloat(window.getComputedStyle(schoolSection).paddingTop) || 0;
        const targetY = sectionTop + padTop + Math.round(window.innerWidth * 1.15) - 8;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[45] transition-all duration-300 ${
        scrolled || mobileOpen
          ? 'bg-black/35 backdrop-blur-md border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.45)]'
          : 'bg-gradient-to-b from-black/55 via-black/20 to-transparent'
      }`}
    >
      <nav
        aria-label="Primary Navigation"
        className="max-w-[1440px] mx-auto h-16 sm:h-20 px-4 sm:px-8 lg:px-14 flex items-center justify-between gap-4"
      >
        {/* Left: Theatrical Monogram Logo + Wordmark */}
        <a
          href="#hero"
          className="inline-flex items-center gap-3 group shrink-0 focus-visible:outline-2 focus-visible:outline-[#F9BD0B] rounded-md"
        >
          <span className="w-10 h-10 rounded-lg border border-[#C99D38]/70 bg-black/35 backdrop-blur-sm flex items-center justify-center font-serif font-bold text-base text-[#F9BD0B] tracking-wider shadow-[0_4px_16px_rgba(0,0,0,0.45)] group-hover:border-[#F9BD0B] transition-colors">
            DT
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg sm:text-xl text-white tracking-wide drop-shadow">
              Diane Taveau
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.24em] text-[#C99D38] font-medium mt-0.5">
              Author · Director
            </span>
          </span>
        </a>

        {/* Center: Desktop Navigation Links */}
        <ul className="hidden lg:flex items-center gap-7 xl:gap-9">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-white/90 hover:text-[#F9BD0B] transition-colors tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)] whitespace-nowrap"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right: Login / Sign Up Icon, Cart Icon & Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenAuth}
            aria-label={user ? `Account (${user.name})` : 'Login or Sign Up'}
            title={user ? user.name : 'Login / Sign Up'}
            className="relative inline-flex items-center justify-center gap-2 h-10 px-2.5 sm:px-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#F9BD0B]"
          >
            <UserRound className="w-[18px] h-[18px]" />
            {user && (
              <span className="hidden sm:inline text-xs font-medium text-white max-w-[90px] truncate">
                {user.name.split(' ')[0]}
              </span>
            )}
            {user && (
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#F9BD0B] ring-2 ring-black"
              />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Shopping Cart (${cartCount} items)`}
            title="View Cart"
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#F9BD0B]"
          >
            <ShoppingBag className="w-[18px] h-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F9BD0B] text-[#111111] text-[10px] font-bold flex items-center justify-center tabular-nums shadow">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#F9BD0B]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-black/85 backdrop-blur-xl px-5 py-5">
          <ul className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block py-2 text-base font-medium text-white hover:text-[#F9BD0B] transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
