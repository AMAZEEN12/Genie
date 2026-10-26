import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { DEMO_USERS, getRoleHomePath } from '../api/auth';
import { useAuth } from '../app/authContext';
import { ApiError } from '../api/client';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaking, setIsWaking] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Focus trap / initial focus and ESC key listener
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Waking indicator after 3 seconds of loading
  useEffect(() => {
    if (!isLoading) return;

    const timer = setTimeout(() => {
      setIsWaking(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    setIsWaking(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError(null);
    setIsLoading(true);
    setIsWaking(false);

    try {
      const session = await login({ email: email.trim(), password });
      setIsLoading(false);
      setIsWaking(false);
      if (onSuccess) {
        onSuccess();
      } else {
        handleClose();
        navigate(getRoleHomePath(session.user.role));
      }
    } catch (err) {
      setIsLoading(false);
      setIsWaking(false);
      if (err instanceof ApiError) {
        if (err.problem.status === 401) {
          setError('Wrong email or password. Try again.');
        } else {
          setError(err.problem.detail ?? err.problem.title ?? 'Login failed. Please try again.');
        }
      } else {
        setError('Network error. Is the service running?');
      }
    }
  };

  const handleDemoSelect = (demo: (typeof DEMO_USERS)[number]) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-[420px] rounded-[20px] bg-[#171717] border border-white/10 p-6 sm:p-8 shadow-2xl relative text-left"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2 id="login-modal-title" className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight mb-6">
          Welcome back
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-medium text-[#A8A8A8] mb-1.5">
              Email
            </label>
            <input
              ref={emailInputRef}
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full h-12 px-4 rounded-[10px] bg-[#121212] border border-[#2E2E2E] text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E1EE04] focus:ring-1 focus:ring-[#E1EE04] transition-all"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-medium text-[#A8A8A8] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-12 pl-4 pr-16 rounded-[10px] bg-[#121212] border border-[#2E2E2E] text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E1EE04] focus:ring-1 focus:ring-[#E1EE04] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#E1EE04] hover:underline cursor-pointer select-none"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div role="alert" className="p-3 rounded-[10px] border border-[#E1EE04] bg-[#E1EE04]/5 text-xs text-white flex items-center gap-2">
              <span className="font-bold text-[#E1EE04]">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-12 rounded-full font-bold text-sm transition-all flex items-center justify-center mt-2 ${
              isLoading
                ? 'bg-[#98A105] text-[#0D0D0D] cursor-not-allowed'
                : 'bg-[#E1EE04] hover:brightness-105 active:scale-[0.99] text-[#0D0D0D] cursor-pointer'
            }`}
          >
            {isLoading ? 'Logging in…' : 'Login'}
          </button>

          {/* Waking state (after 3s) */}
          {isWaking && (
            <div className="flex items-center justify-center gap-2 text-xs text-[#A8A8A8] pt-1">
              <span className="w-2 h-2 rounded-full bg-[#E1EE04] shrink-0 animate-pulse" />
              <span>Warming up. Ready in a few minutes, hang tight.</span>
            </div>
          )}
        </form>

        {/* Demo Data Section */}
        <div className="border-t border-white/10 my-5 pt-4">
          <p className="text-[11px] text-[#888888] font-serif italic mb-3">Demo data only</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.roleName}
                type="button"
                onClick={() => handleDemoSelect(demo)}
                className="px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-xs font-medium text-white transition-colors cursor-pointer"
              >
                {demo.roleName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
