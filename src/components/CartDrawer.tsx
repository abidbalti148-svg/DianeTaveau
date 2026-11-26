import { useEffect, useState } from 'react';
import { Check, Mail, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { BOOKS, BookItem } from '../data/authorData';

export interface CartEntry {
  book: BookItem;
  quantity: number;
}

interface CartDrawerProps {
  open: boolean;
  items: CartEntry[];
  onClose: () => void;
  onAddBook: (book: BookItem) => void;
  onUpdateQty: (bookId: BookItem['id'], delta: number) => void;
  onRemoveItem: (bookId: BookItem['id']) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  open,
  items,
  onClose,
  onAddBook,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const orderLines = items
    .map((entry) => `- ${entry.book.title} (x${entry.quantity}) - $${entry.book.price * entry.quantity}`)
    .join('\n');
  const mailtoHref = `mailto:taveaudiane@gmail.com?subject=${encodeURIComponent(
    `Book Order Request (${totalCount} ${totalCount === 1 ? 'copy' : 'copies'})`
  )}&body=${encodeURIComponent(
    `Hello Diane,\n\nI would like to order the following books:\n${orderLines}\n\nEstimated Total: $${subtotal}\n\nBest regards,`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md h-full bg-[#111111] border-l border-white/15 flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#F9BD0B]" />
            <h2 id="cart-drawer-title" className="font-serif text-2xl text-white">
              Your Bag ({totalCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {items.length === 0 ? (
            <div className="space-y-6 py-4">
              <p className="text-sm text-white leading-relaxed">
                Your bag is currently empty. Add one of Diane Taveau’s books below to request copies.
              </p>

              <div className="space-y-3">
                {BOOKS.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <img
                      src={book.coverSrc}
                      alt={book.title}
                      className="w-12 h-16 object-contain shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-base text-white truncate">{book.title}</h3>
                      <p className="text-xs text-[#C99D38] font-medium">${book.price}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddBook(book)}
                      className="px-3.5 py-2 rounded-full bg-[#F9BD0B] hover:bg-[#ffd03b] text-[#111111] text-xs font-semibold transition-colors shrink-0"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(({ book, quantity }) => (
                <li
                  key={book.id}
                  className="flex gap-4 p-3.5 rounded-xl bg-white/5 border border-white/10"
                >
                  <img
                    src={book.coverSrc}
                    alt={book.title}
                    className="w-16 h-24 object-contain shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-base text-white leading-snug">
                          {book.title}
                        </h3>
                        <p className="text-xs text-[#C99D38] mt-0.5">${book.price} each</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(book.id)}
                        aria-label={`Remove ${book.title}`}
                        className="text-zinc-400 hover:text-white p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div className="inline-flex items-center rounded-full border border-white/20 bg-black/40">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(book.id, -1)}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 flex items-center justify-center text-white hover:text-[#F9BD0B]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-white tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(book.id, 1)}
                          aria-label="Increase quantity"
                          className="w-8 h-8 flex items-center justify-center text-white hover:text-[#F9BD0B]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-white tabular-nums">
                        ${book.price * quantity}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-4 bg-black/50">
            <div className="flex items-center justify-between text-base">
              <span className="text-white/80">Estimated Total</span>
              <span className="font-serif text-2xl text-white tabular-nums">${subtotal}</span>
            </div>

            {submitted && (
              <p className="flex items-center gap-2 text-xs text-[#F9BD0B] font-medium">
                <Check className="w-4 h-4 shrink-0" />
                Opening your email client to send this book request to Diane.
              </p>
            )}

            <div className="flex flex-col gap-2.5">
              <a
                href={mailtoHref}
                onClick={() => setSubmitted(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#F9BD0B] hover:bg-[#ffd03b] text-[#111111] font-semibold text-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                Request Order via Email
              </a>
              <button
                type="button"
                onClick={onClearCart}
                className="w-full py-2 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Clear Bag
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
