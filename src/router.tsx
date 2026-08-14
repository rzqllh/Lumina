import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { PlaceholderRoute } from '@/routes/PlaceholderRoute';

export const router = createBrowserRouter([
  // Authenticated Owner Shell Routes
  {
    path: '/',
    element: <AppShell />,
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
      {
        path: 'clients',
        element: (
          <PlaceholderRoute
            title="Clients & Directory"
            description="Client contact directory, engagement history, and active project assignments."
          />
        ),
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
  // Public Anonymous Projection Routes (Isolated Shell)
  {
    path: '/share/:token',
    element: (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
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
      <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
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
