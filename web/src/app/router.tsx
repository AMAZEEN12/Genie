import { createBrowserRouter, type RouteObject } from 'react-router';
import { HomePage } from '../features/home/HomePage';
import { ReportFaultPage } from '../features/requests/ReportFaultPage';
import { AppLayout } from '../layouts/AppLayout';
import { NotFoundPage } from '../pages/NotFoundPage';

/** Feature pages from plan.md are registered here; route objects use React Router's Component API. */
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'requests/new', Component: ReportFaultPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
];

export const router = createBrowserRouter(routes);
