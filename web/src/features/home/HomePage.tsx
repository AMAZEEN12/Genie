import { useHealth } from '../../api/health';

/** Placeholder home: proves the app, the API client and TanStack Query are wired to the service or mock. */
export function HomePage() {
  const health = useHealth();

  return (
    <section aria-labelledby="home-title" className="space-y-4">
      <h1 id="home-title" className="text-2xl font-semibold">Report a fault, follow the repair</h1>
      <p className="max-w-prose text-slate-600">
        Genie records every maintenance request from the moment a fault is reported to the moment a manager confirms the repair.
      </p>
      <p role="status" className="text-sm">
        {health.isPending && 'Checking the serviceâ€¦'}
        {health.isError && <span className="text-red-700">Service unreachable. Is the service or the mock running?</span>}
        {health.isSuccess && (
          <span className={health.data.status === 'UP' ? 'text-emerald-700' : 'text-amber-700'}>
            Service {health.data.status === 'UP' ? 'is up' : 'is degraded'}
          </span>
        )}
      </p>
    </section>
  );
}
