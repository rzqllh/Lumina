import { useWorkspace, useAuth } from '@/lib/auth';
import {
  useDashboardData,
  NeedsAttentionCard,
  TodayAgendaCard,
  WorkspaceMetricsGrid,
  ActiveProjectsGrid,
  QuickActionBar,
  UpcomingSessionsCard,
} from '@/features/dashboard';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function DashboardRoute() {
  const { workspaceId, currentWorkspace } = useWorkspace();
  const { user } = useAuth();

  const wsId = workspaceId ?? '';
  const { data, isLoading, error, refetch } = useDashboardData(wsId);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Creator';

  return (
    <div className="space-y-6">
      {/* Greeting & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            Welcome back, {userName}
          </h1>
          <p className="mt-0.5 text-xs text-text-secondary">
            {currentWorkspace?.name || 'Personal Workspace'}
          </p>
        </div>

        <QuickActionBar />
      </div>

      {/* Global Query Error */}
      {error && (
        <div
          role="alert"
          data-testid="dashboard-error"
          className="flex items-center justify-between rounded-xl border border-status-danger/25 bg-status-danger/8 p-4 text-xs text-status-danger"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="font-medium">
              {error instanceof Error ? error.message : 'Failed to load workspace dashboard data'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1 text-[11px] font-bold underline cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}

      {/* Top Workspace Health Metrics */}
      <WorkspaceMetricsGrid
        metrics={
          data?.metrics || {
            activeProjectsCount: 0,
            unpaidReceivablesTotal: 0,
            receivedRevenueTotal: 0,
            sessionsScheduledThisMonth: 0,
          }
        }
        isLoading={isLoading}
      />

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Primary Operational Focus */}
        <div className="lg:col-span-2 space-y-6">
          {/* Needs Attention (Overdue deliverables, overdue invoices, revision requests) */}
          <NeedsAttentionCard items={data?.attentionItems || []} isLoading={isLoading} />

          {/* Today's Focus (Shoots today, tasks due today, payments expected today) */}
          <TodayAgendaCard items={data?.todayItems || []} isLoading={isLoading} />

          {/* Active Projects Overview Matrix */}
          <ActiveProjectsGrid projects={data?.activeProjects || []} isLoading={isLoading} />
        </div>

        {/* Right 1 Col: Horizon & Upcoming */}
        <div className="space-y-6">
          {/* Upcoming Shoots (Next 7-14 days) */}
          <UpcomingSessionsCard sessions={data?.upcomingSessions || []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
