import { createBrowserRouter, type RouteObject } from 'react-router';
import { HomePage } from '../features/home/HomePage';
import { ReportFaultPage } from '../features/requests/ReportFaultPage';
import { RequestListPage } from '../features/requests/RequestListPage';
import { AppLayout } from '../layouts/AppLayout';
import { NotFoundPage } from '../pages/NotFoundPage';

/** Feature pages from plan.md are registered here; route objects use React Router's Component API. */
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'requests', Component: RequestListPage },
      { path: 'requests/new', Component: ReportFaultPage },
      {
        path: 'my-jobs',
        Component: () => <RequestListPage preset="my-jobs" />,
      },
      {
        path: 'approvals',
        Component: () => <RequestListPage preset="approvals" />,
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
];

export const router = createBrowserRouter(routes);
