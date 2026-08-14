import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicOnlyRoute } from '@/components/auth/PublicOnlyRoute';
import { LoginRoute } from '@/routes/auth/LoginRoute';
import { AuthCallbackRoute } from '@/routes/auth/AuthCallbackRoute';
import { PlaceholderRoute } from '@/routes/PlaceholderRoute';
import { ClientsListRoute } from '@/routes/clients/ClientsListRoute';
import { ClientNewRoute } from '@/routes/clients/ClientNewRoute';
import { ClientDetailRoute } from '@/routes/clients/ClientDetailRoute';
import { ClientEditRoute } from '@/routes/clients/ClientEditRoute';

export const router = createBrowserRouter([
  // Public-only Authentication Routes
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginRoute />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackRoute />,
  },

  // Authenticated Owner Shell Routes (Protected by ProtectedRoute)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <PlaceholderRoute
            title="Overview & Dashboard"
            description="High-level workspace operational summary, urgent tasks, and upcoming shoots."
          />
        ),
      },
      {
        path: 'projects',
        element: (
          <PlaceholderRoute
            title="Projects Pipeline"
            description="Active gigs, workflow progress, deliverables, and payment tracking."
          />
        ),
      },
      {
        path: 'calendar',
        element: (
          <PlaceholderRoute
            title="Schedule & Calendar"
            description="Shoot sessions, client meetings, and milestone deadlines synced with Google Calendar."
          />
        ),
      },
      // Real Clients & Contacts Module
      {
        path: 'clients',
        element: <ClientsListRoute />,
      },
      {
        path: 'clients/new',
        element: <ClientNewRoute />,
      },
      {
        path: 'clients/:clientId',
        element: <ClientDetailRoute />,
      },
      {
        path: 'clients/:clientId/edit',
        element: <ClientEditRoute />,
      },
      {
        path: 'settings',
        element: (
          <PlaceholderRoute
            title="Workspace Settings"
            description="Catalog services, packages, workflow templates, brief templates, and Google integrations."
          />
        ),
      },
    ],
  },

  // Public Anonymous Projection Routes (Isolated Shell, No Auth Required)
  {
    path: '/share/:token',
    element: (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <PlaceholderRoute
          title="Client Project Status Portal"
          description="Live project progress projection, session schedules, and approved deliverables."
          isPublic
        />
      </main>
    ),
  },
  {
    path: '/brief/:token',
    element: (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <PlaceholderRoute
          title="Client Brief Intake Form"
          description="Interactive questionnaire for project requirements, moodboards, and logistics."
          isPublic
        />
      </main>
    ),
  },

  // Catch-all route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
