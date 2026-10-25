import { Link } from 'react-router';

export function NotFound() {
  return (
    <section aria-labelledby="not-found-title" className="space-y-4 py-12 text-center">
      <h1 id="not-found-title" className="text-3xl font-display font-extrabold text-white">
        Page not found
      </h1>
      <p className="text-[#A8A8A8] text-sm">
        The requested screen does not exist or has not been deployed yet.
      </p>
      <div>
        <Link
          to="/"
          className="inline-block px-5 py-2 rounded-full bg-[#E1EE04] text-[#0D0D0D] font-bold text-sm hover:brightness-105 transition-all"
        >
          Back to the start
        </Link>
      </div>
    </section>
  );
}
