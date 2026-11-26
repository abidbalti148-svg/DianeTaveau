import { useEffect, useState } from 'react';
import { Navbar, AuthUser } from './components/Navbar';
import { AccountModal } from './components/AccountModal';
import { CartDrawer, CartEntry } from './components/CartDrawer';
import { HeroAndBooksScene } from './components/HeroAndBooksScene';
import { AboutAndMarquee } from './components/AboutAndMarquee';
import { InsideTheRules } from './components/InsideTheRules';
import { SchoolEdition } from './components/SchoolEdition';
import { NewsletterSection, SiteFooter } from './components/NewsletterAndFooter';
import { BookDetailModal } from './components/BookDetailModal';
import { BookItem } from './data/authorData';

export default function App() {
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('dt_auth_user');
      return saved ? (JSON.parse(saved) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const [cartItems, setCartItems] = useState<CartEntry[]>(() => {
    try {
      const saved = localStorage.getItem('dt_cart_items');
      return saved ? (JSON.parse(saved) as CartEntry[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem('dt_auth_user', JSON.stringify(user));
      else localStorage.removeItem('dt_auth_user');
    } catch {
      // ignore storage errors
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('dt_cart_items', JSON.stringify(cartItems));
    } catch {
      // ignore storage errors
    }
  }, [cartItems]);

  const handleAddToCart = (book: BookItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.book.id === book.id);
      if (existing) {
        return prev.map((item) =>
          item.book.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { book, quantity: 1 }];
    });
  };

  const handleUpdateQty = (bookId: BookItem['id'], delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.book.id === bookId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (bookId: BookItem['id']) => {
    setCartItems((prev) => prev.filter((item) => item.book.id !== bookId));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar
        cartCount={cartCount}
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenCart={() => setCartOpen(true)}
      />

      <HeroAndBooksScene onSelectBook={setSelectedBook}>
        <AboutAndMarquee />
        <InsideTheRules />
        <SchoolEdition onOpenSchoolOrder={setSelectedBook} />
        <NewsletterSection />
      </HeroAndBooksScene>

      <SiteFooter onSelectBook={setSelectedBook} />

      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onAddToCart={handleAddToCart}
      />

      <AccountModal
        open={authOpen}
        user={user}
        onClose={() => setAuthOpen(false)}
        onLogin={setUser}
        onLogout={() => setUser(null)}
      />

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onAddBook={handleAddToCart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
      />
    </main>
  );
}
