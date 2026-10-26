import { Outlet, useLocation } from 'react-router';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white selection:bg-[#E1EE04] selection:text-[#0D0D0D]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[10px] focus:bg-[#E1EE04] focus:text-[#0D0D0D] focus:px-4 focus:py-2 focus:font-semibold"
      >
        Skip to content
      </a>

      {isLandingPage ? (
        <Outlet />
      ) : (
        <main id="main" className="mx-auto max-w-5xl px-4 py-8">
          <Outlet />
        </main>
      )}
    </div>
  );
}
