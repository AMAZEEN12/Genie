import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-title" className="space-y-3">
      <h1 id="not-found-title" className="text-2xl font-semibold">Page not found</h1>
      <Link to="/" className="text-sky-700 underline">Back to the start</Link>
    </section>
  );
}
