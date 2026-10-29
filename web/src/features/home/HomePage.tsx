/** Placeholder home: proves the app, the API client and TanStack Query are wired to the service or mock. */
import { useState } from "react";
import { useNavigate } from "react-router";
import { getRoleHomePath } from "../../service/api/auth.api";
import { useAuth } from "../../hooks/useAuth";
import { GenieLogo } from "../../components/GenieLogo";
import { LoginModal } from "../../components/LoginModal";
import { useHealth } from "../../hooks/useHealth";

export function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const health = useHealth();

  const handleAction = () => {
    if (isAuthenticated && user) {
      navigate(getRoleHomePath(user.role));
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none">
      {/* Top Bar Navigation */}
      <header className="w-full flex justify-end items-center z-10">
        <nav aria-label="Main Navigation" className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <button
              type="button"
              onClick={() => navigate(getRoleHomePath(user.role))}
              className="px-5 py-2 rounded-full bg-[#E1EE04] text-[#0D0D0D] text-sm font-semibold hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
            >
              Go to dashboard
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="px-5 py-2 rounded-full border border-white/20 hover:border-white/40 bg-transparent text-sm font-semibold text-white transition-all cursor-pointer hover:bg-white/5 active:scale-[0.98]"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="px-5 py-2 rounded-full bg-[#E1EE04] text-[#0D0D0D] text-sm font-semibold hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
              >
                Get started
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Main Hero Content */}
      <main
        id="main"
        className="my-auto py-12 flex flex-col items-center text-center sm:items-start sm:text-left max-w-5xl mx-auto w-full"
      >
        {/* Brand Wordmark */}
        <div className="mb-6 sm:mb-8">
          <GenieLogo size="hero" />
        </div>

        {/* Tagline */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-[80px] leading-[1.05] tracking-tight max-w-3xl">
          Close the loop on{" "}
          <span className="text-[#E1EE04]">every repair.</span>
        </h1>

        {/* Subtitle / Description */}
        <p className="mt-6 text-base sm:text-lg text-[#A8A8A8] max-w-xl font-normal leading-relaxed">
          Genie records every maintenance request from the moment a fault is
          reported to the moment a manager confirms the repair.
        </p>

        {/* Quick CTA: centred on small screens with the rest of the hero, left-aligned from sm up */}
        <div className="mt-8 flex justify-center sm:justify-start">
          <button
            type="button"
            onClick={handleAction}
            className="px-6 py-3 rounded-full bg-[#E1EE04] text-[#0D0D0D] text-base font-bold hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
          >
            {isAuthenticated
              ? "Open your workspace"
              : "Report or manage a fault"}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </div>
      </main>

      {/* Footer / Subtle System Health State */}
      <footer className="w-full flex justify-between items-center text-xs text-[#666666] pt-8">
        <div>
          <span>Genie · Maintenance tracking</span>
        </div>
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-1.5"
        >
          {health.isPending && (
            <span className="text-[#888888]">Checking service…</span>
          )}
          {health.isError && (
            <span className="text-[#FF6B5E] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF6B5E]" />
              Service offline
            </span>
          )}
          {health.isSuccess && (
            <span className="text-[#888888] flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  health.data.status === "UP" ? "bg-[#E1EE04]" : "bg-[#FF6B5E]"
                }`}
              />
              Service {health.data.status === "UP" ? "operational" : "degraded"}
            </span>
          )}
        </div>
      </footer>

      {/* Login Modal Overlay */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
