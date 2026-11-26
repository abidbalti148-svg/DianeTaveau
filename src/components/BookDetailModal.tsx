import { useEffect, useState } from 'react';
import { X, Mail, BookOpen, Check, ShoppingBag } from 'lucide-react';
import { BookItem } from '../data/authorData';

interface BookDetailModalProps {
  book: BookItem | null;
  onClose: () => void;
  onAddToCart: (book: BookItem) => void;
}

export function BookDetailModal({ book, onClose, onAddToCart }: BookDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setAdded(false);
    if (!book) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book, onClose]);

  if (!book) return null;

  const mailtoSubject = encodeURIComponent(`Order & Availability Inquiry: ${book.title}`);
  const mailtoBody = encodeURIComponent(
    `Hello Diane,\n\nI would like to order or inquire about "${book.title}".\n\nBest regards,`
  );
  const mailtoHref = `mailto:taveaudiane@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('taveaudiane@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#111111] border border-white/15 rounded-xl p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close book details"
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#F9BD0B]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-6 items-center">
          <div className="mx-auto w-40 sm:w-full">
            <img
              src={book.coverSrc}
              alt={book.title}
              referrerPolicy="no-referrer"
              className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
            />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs tracking-[0.18em] uppercase text-[#C99D38] font-medium">
                {book.subtitle} · ${book.price}
              </p>
              <h3
                id="book-modal-title"
                className="font-serif text-2xl sm:text-3xl text-white mt-1"
              >
                {book.title}
              </h3>
            </div>

            <p className="text-sm sm:text-base text-white leading-relaxed">
              {book.description}
            </p>

            <p className="text-sm text-zinc-300 leading-relaxed">
              {book.editionNote}
            </p>

            <div className="pt-2 border-t border-white/10 text-xs text-zinc-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#F9BD0B] shrink-0" />
              <span>Recommended for {book.audience}</span>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(book);
                  setAdded(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#F9BD0B] hover:bg-[#ffd03b] text-[#111111] font-semibold text-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                {added ? 'Added to Cart' : `Add to Cart · $${book.price}`}
              </button>

              {book.purchaseUrl ? (
                <a
                  href={book.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-white font-medium text-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#F9BD0B]"
                >
                  Order Copy
                </a>
              ) : (
                <a
                  href={mailtoHref}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/20 hover:border-white/40 text-white font-medium text-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#F9BD0B]"
                >
                  <Mail className="w-4 h-4" />
                  Email Inquiry
                </a>
              )}

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-zinc-300 hover:text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#F9BD0B]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#F9BD0B]" />
                    Email Copied
                  </>
                ) : (
                  'Copy taveaudiane@gmail.com'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
