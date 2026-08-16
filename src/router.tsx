import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicOnlyRoute } from '@/components/auth/PublicOnlyRoute';
import { LoginRoute } from '@/routes/auth/LoginRoute';
import { AuthCallbackRoute } from '@/routes/auth/AuthCallbackRoute';
import { DashboardRoute } from '@/routes/dashboard/DashboardRoute';
import { CalendarRoute } from '@/routes/calendar/CalendarRoute';
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
import { WorkflowTemplatesRoute } from '@/routes/catalog/WorkflowTemplatesRoute';
import { SettingsRoute } from '@/routes/settings/SettingsRoute';
import { GuideRoute } from '@/routes/settings/GuideRoute';
import { CollaboratorsRoute } from '@/routes/settings/CollaboratorsRoute';
import { PublicBriefIntakeRoute } from '@/routes/briefs/PublicBriefIntakeRoute';

import { PublicProjectStatusRoute } from '@/routes/portal/PublicProjectStatusRoute';

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
      // Real Daily Operating Dashboard (Feature #10)
      {
        index: true,
        element: <DashboardRoute />,
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
      // Real Production Calendar Module (Feature #10)
      {
        path: 'calendar',
        element: <CalendarRoute />,
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
      // Real Workflow Templates Catalog Module
      {
        path: 'workflows',
        element: <WorkflowTemplatesRoute />,
      },
      // Real Crew & Collaborators Catalog Module (STAB-P1-001)
      {
        path: 'collaborators',
        element: <CollaboratorsRoute />,
      },
      {
        path: 'settings/collaborators',
        element: <CollaboratorsRoute />,
      },
      // Workspace Settings Hub & Guide
      {
        path: 'settings',
        element: <SettingsRoute />,
      },
      {
        path: 'settings/guide',
        element: <GuideRoute />,
      },
    ],
  },

  // Public Anonymous Projection Routes (Isolated Shell, No Auth Required)
  {
    path: '/share/:token',
    element: <PublicProjectStatusRoute />,
  },
  {
    path: '/brief/:token',
    element: <PublicBriefIntakeRoute />,
  },

  // Catch-all route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
