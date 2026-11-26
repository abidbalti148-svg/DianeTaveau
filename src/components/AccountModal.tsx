import { FormEvent, useEffect, useState } from 'react';
import { LogOut, UserRound, X } from 'lucide-react';
import { AuthUser } from './Navbar';

interface AccountModalProps {
  open: boolean;
  user: AuthUser | null;
  onClose: () => void;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
}

export function AccountModal({
  open,
  user,
  onClose,
  onLogin,
  onLogout,
}: AccountModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (mode === 'signup' && trimmedName.length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    const resolvedName =
      mode === 'signup' ? trimmedName : trimmedEmail.split('@')[0] || 'Reader';
    onLogin({ name: resolvedName, email: trimmedEmail });
    setPassword('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#111111] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close account modal"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F9BD0B]/15 border border-[#F9BD0B]/50 flex items-center justify-center text-[#F9BD0B]">
                <UserRound className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#C99D38] font-medium">
                  Reader Account
                </p>
                <h2 id="account-modal-title" className="font-serif text-2xl text-white">
                  {user.name}
                </h2>
                <p className="text-sm text-zinc-300">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/20 hover:bg-white/10 text-white text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#C99D38] font-medium mb-1">
                Diane Taveau
              </p>
              <h2 id="account-modal-title" className="font-serif text-2xl sm:text-3xl text-white">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
            </div>

            <div className="grid grid-cols-2 p-1 rounded-full bg-white/10 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                  mode === 'login' ? 'bg-[#F9BD0B] text-[#111111]' : 'text-white/80 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className={`py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                  mode === 'signup' ? 'bg-[#F9BD0B] text-[#111111]' : 'text-white/80 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label htmlFor="auth-name" className="block text-xs font-medium text-white">
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#F9BD0B]"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="auth-email" className="block text-xs font-medium text-white">
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#F9BD0B]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="auth-password" className="block text-xs font-medium text-white">
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#F9BD0B]"
                />
              </div>

              {error && (
                <p role="alert" className="text-xs text-amber-300 font-medium">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#F9BD0B] hover:bg-[#ffd03b] text-[#111111] font-semibold text-sm transition-colors"
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
