import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import type { Role } from '../api/auth';
import { useAuth } from '../app/authContext';
import { GenieLogo } from '../components/GenieLogo';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

function getNavItemsForRole(role: Role): NavItem[] {
  switch (role) {
    case 'EMPLOYEE':
      return [
        {
          label: 'Report a fault',
          to: '/requests/new',
          icon: (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          ),
        },
        {
          label: 'My requests',
          to: '/requests',
          icon: (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          ),
        },
      ];
    case 'MANAGER':
      return [
        {
          label: 'All requests',
          to: '/requests',
          icon: (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          ),
        },
        {
          label: 'Report a fault',
          to: '/requests/new',
          icon: (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          ),
        },
      ];
    case 'TECHNICIAN':
      return [
        {
          label: 'My jobs',
          to: '/my-jobs',
          icon: (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          ),
        },
        {
          label: 'All requests',
          to: '/requests',
          icon: (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          ),
        },
      ];
    case 'FINANCE':
      return [
        {
          label: 'Approvals',
          to: '/approvals',
          icon: (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          ),
        },
        {
          label: 'All requests',
          to: '/requests',
          icon: (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          ),
        },
      ];
  }
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLandingPage = location.pathname === '/';
  const isProtectedRoute =
    location.pathname.startsWith('/requests') ||
    location.pathname.startsWith('/my-jobs') ||
    location.pathname.startsWith('/approvals');

  // Automatically close mobile menu when navigating on mobile
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle Escape key to close mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 1. Landing page renders directly with full-screen layout
  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white selection:bg-[#E1EE04] selection:text-[#0D0D0D]">
        <Outlet />
      </div>
    );
  }

  // 2. Protected routes: if not authenticated and not loading, show redirect prompt or redirect to home
  if (isProtectedRoute && !isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-6">
          <GenieLogo size="header" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Session expired or sign-in required</h1>
        <p className="text-[#A8A8A8] text-sm max-w-md mb-6">
          Please log in to access your Genie maintenance dashboard.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-[10px] bg-[#E1EE04] text-[#0D0D0D] font-bold text-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
        >
          Return to home
        </button>
      </div>
    );
  }

  // 3. Fallback for unauthenticated non-protected routes (e.g. 404 NotFound)
  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white selection:bg-[#E1EE04] selection:text-[#0D0D0D]">
        <Outlet />
      </div>
    );
  }

  const navItems = user ? getNavItemsForRole(user.role) : [];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white selection:bg-[#E1EE04] selection:text-[#0D0D0D] flex flex-col md:flex-row">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[10px] focus:bg-[#E1EE04] focus:text-[#0D0D0D] focus:px-4 focus:py-2 focus:font-semibold"
      >
        Skip to content
      </a>

      {/* Desktop Fixed Sidebar (240px width) */}
      <aside
        aria-label="Sidebar navigation"
        className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-[#1A1A1A] border-r border-white/14 z-30"
      >
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-white/14">
          <GenieLogo size="header" />
        </div>

        {/* Navigation links */}
        <nav aria-label="Main Navigation" className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E1EE04] text-[#0D0D0D] font-semibold'
                    : 'text-[#A8A8A8] hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User profile footer */}
        {user && (
          <div className="p-4 border-t border-white/14 bg-[#141414]">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-9 h-9 rounded-full bg-[#222222] border border-white/14 flex items-center justify-center font-bold text-sm text-[#E1EE04] shrink-0"
                  aria-hidden="true"
                >
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white truncate" title={user.displayName}>
                    {user.displayName}
                  </div>
                  <div className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-full bg-white/10 text-[#A8A8A8] uppercase">
                    {user.role}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className="p-2 text-[#A8A8A8] hover:text-[#FF6B5E] hover:bg-white/5 rounded-[10px] transition-colors cursor-pointer shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Top Bar (<768px) */}
      <header className="md:hidden sticky top-0 z-40 h-16 bg-[#1A1A1A] border-b border-white/14 px-4 flex items-center justify-between">
        <GenieLogo size="header" />
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          className="p-2.5 rounded-[10px] text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Drawer Backdrop & Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop with click-to-dismiss */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div
            role="dialog"
            aria-label="Navigation drawer"
            aria-modal="true"
            className="relative w-72 max-w-[80vw] bg-[#1A1A1A] border-r border-white/14 flex flex-col h-full z-10 shadow-2xl p-5"
            style={{ overscrollBehavior: 'contain' }}
          >
            <div className="flex items-center justify-between pb-5 border-b border-white/14">
              <GenieLogo size="header" />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 text-[#A8A8A8] hover:text-white rounded-[10px] transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav aria-label="Mobile Navigation" className="flex-1 py-6 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-[#E1EE04] text-[#0D0D0D] font-semibold'
                        : 'text-[#A8A8A8] hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {user && (
              <div className="pt-4 border-t border-white/14">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full bg-[#222222] border border-white/14 flex items-center justify-center font-bold text-base text-[#E1EE04] shrink-0"
                      aria-hidden="true"
                    >
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white truncate" title={user.displayName}>
                        {user.displayName}
                      </div>
                      <div className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-full bg-white/10 text-[#A8A8A8] uppercase">
                        {user.role}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Log out"
                    aria-label="Log out"
                    className="p-2 text-[#A8A8A8] hover:text-[#FF6B5E] hover:bg-white/5 rounded-[10px] transition-colors cursor-pointer shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 md:ml-60 min-h-screen px-4 py-6 md:px-8 md:py-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
