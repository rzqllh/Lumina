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
import { ProjectsListRoute } from '@/routes/projects/ProjectsListRoute';
import { ProjectNewRoute } from '@/routes/projects/ProjectNewRoute';
import { ProjectDetailRoute } from '@/routes/projects/ProjectDetailRoute';
import { ProjectEditRoute } from '@/routes/projects/ProjectEditRoute';
import { ServicesListRoute } from '@/routes/catalog/ServicesListRoute';
import { ServiceNewRoute } from '@/routes/catalog/ServiceNewRoute';
import { ServiceEditRoute } from '@/routes/catalog/ServiceEditRoute';
import { PackagesListRoute } from '@/routes/catalog/PackagesListRoute';
import { PackageNewRoute } from '@/routes/catalog/PackageNewRoute';
import { PackageEditRoute } from '@/routes/catalog/PackageEditRoute';
import { SettingsRoute } from '@/routes/settings/SettingsRoute';

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
      // Real Projects & Engagements Module
      {
        path: 'projects',
        element: <ProjectsListRoute />,
      },
      {
        path: 'projects/new',
        element: <ProjectNewRoute />,
      },
      {
        path: 'projects/:projectId',
        element: <ProjectDetailRoute />,
      },
      {
        path: 'projects/:projectId/edit',
        element: <ProjectEditRoute />,
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
      // Real Services & Packages Catalog Module
      {
        path: 'services',
        element: <ServicesListRoute />,
      },
      {
        path: 'services/new',
        element: <ServiceNewRoute />,
      },
      {
        path: 'services/:serviceId/edit',
        element: <ServiceEditRoute />,
      },
      {
        path: 'packages',
        element: <PackagesListRoute />,
      },
      {
        path: 'packages/new',
        element: <PackageNewRoute />,
      },
      {
        path: 'packages/:packageId/edit',
        element: <PackageEditRoute />,
      },
      // Workspace Settings Hub
      {
        path: 'settings',
        element: <SettingsRoute />,
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
