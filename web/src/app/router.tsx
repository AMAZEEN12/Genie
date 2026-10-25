import { createBrowserRouter, type RouteObject } from 'react-router';
import { Layout } from '../routes/Layout';
import { Home } from '../routes/Home';
import { NotFound } from '../routes/NotFound';

/** Screens from plan.md are added here: login, report a fault, my requests, request list and detail, approvals. */
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
