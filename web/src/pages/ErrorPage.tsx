import { Link, useRouteError } from 'react-router';

export function ErrorPage() {
  const error = useRouteError() as Error | undefined;

  return (
    <section aria-labelledby="error-title" className="space-y-4 py-12 text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-full bg-[#FF6B5E]/15 border border-[#FF6B5E]/40 text-[#FF6B5E] flex items-center justify-center mx-auto text-xl font-bold">
        !
      </div>
      <h1 id="error-title" className="text-2xl font-display font-extrabold text-white">
        Something went wrong
      </h1>
      <p className="text-[#A8A8A8] text-sm leading-relaxed">
        {error?.message || 'An unexpected application error occurred while loading this page.'}
      </p>
      <div className="pt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all cursor-pointer"
        >
          Reload page
        </button>
        <Link
          to="/"
          className="px-5 py-2 rounded-full bg-[#E1EE04] text-[#0D0D0D] font-bold text-sm hover:brightness-105 transition-all"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
