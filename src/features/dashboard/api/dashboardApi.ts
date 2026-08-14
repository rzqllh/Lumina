import { supabase } from '@/lib/supabase';
import type { AttentionItem, TodayItem, WorkspaceSummaryMetrics, CalendarEvent } from '../types';
import type { Project } from '@/features/projects';
import type { Session } from '@/features/sessions';
import type { Deliverable } from '@/features/deliverables';
import type { Payment } from '@/features/finance';
import type { Task } from '@/features/project-workflow';

export async function fetchWorkspaceDashboardData(workspaceId: string): Promise<{
  activeProjects: (Project & { client?: { display_name?: string } })[];
  attentionItems: AttentionItem[];
  todayItems: TodayItem[];
  upcomingSessions: Session[];
  metrics: WorkspaceSummaryMetrics;
}> {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Fetch active & draft projects
  const { data: rawProjects, error: projError } = await supabase
    .from('projects')
    .select('*, client:clients(display_name)')
    .eq('workspace_id', workspaceId)
    .in('status', ['active', 'draft'])
    .order('updated_at', { ascending: false });

  if (projError) throw projError;
  const activeProjects = (rawProjects || []) as (Project & {
    client?: { display_name?: string };
  })[];
  const activeProjectIds = activeProjects.map((p) => p.id);

  if (activeProjectIds.length === 0) {
    return {
      activeProjects: [],
      attentionItems: [],
      todayItems: [],
      upcomingSessions: [],
      metrics: {
        activeProjectsCount: 0,
        unpaidReceivablesTotal: 0,
        receivedRevenueTotal: 0,
        sessionsScheduledThisMonth: 0,
      },
    };
  }

  // 2. Fetch payments, sessions, deliverables, tasks in parallel
  const [paymentsRes, sessionsRes, deliverablesRes, tasksRes] = await Promise.all([
    supabase
      .from('payments')
      .select('*, project:projects(title)')
      .eq('workspace_id', workspaceId)
      .in('project_id', activeProjectIds),
    supabase
      .from('sessions')
      .select('*, project:projects(title)')
      .eq('workspace_id', workspaceId)
      .in('project_id', activeProjectIds)
      .order('date', { ascending: true }),
    supabase
      .from('deliverables')
      .select('*, project:projects(title)')
      .eq('workspace_id', workspaceId)
      .in('project_id', activeProjectIds),
    supabase
      .from('project_tasks')
      .select('*, project:projects(title)')
      .eq('workspace_id', workspaceId)
      .in('project_id', activeProjectIds)
      .eq('status', 'open'),
  ]);

  const payments = (paymentsRes.data || []) as (Payment & { project?: { title?: string } })[];
  const sessions = (sessionsRes.data || []) as (Session & { project?: { title?: string } })[];
  const deliverables = (deliverablesRes.data || []) as (Deliverable & {
    project?: { title?: string };
  })[];
  const tasks = (tasksRes.data || []) as (Task & { project?: { title?: string } })[];

  // 3. Compute Needs Attention Items
  const attentionItems: AttentionItem[] = [];

  // Overdue payments
  for (const pay of payments) {
    if (pay.status === 'pending' && pay.due_date < todayStr) {
      attentionItems.push({
        id: `pay-${pay.id}`,
        type: 'overdue_payment',
        title: pay.label || `${pay.type.toUpperCase()} Payment`,
        subtitle: `Overdue since ${pay.due_date}`,
        dueDate: pay.due_date,
        projectId: pay.project_id,
        projectTitle: pay.project?.title || 'Active Project',
        amount: pay.amount,
        severity: 'high',
      });
    }
  }

  // Overdue deliverables or revision requests
  for (const del of deliverables) {
    if (del.status === 'revision_requested') {
      attentionItems.push({
        id: `rev-${del.id}`,
        type: 'revision_requested',
        title: del.label,
        subtitle: 'Client requested revisions',
        dueDate: del.deadline || todayStr,
        projectId: del.project_id,
        projectTitle: del.project?.title || 'Active Project',
        severity: 'high',
      });
    } else if (del.status !== 'approved' && del.deadline && del.deadline < todayStr) {
      attentionItems.push({
        id: `del-${del.id}`,
        type: 'overdue_deliverable',
        title: del.label,
        subtitle: `Delivery target missed (${del.deadline})`,
        dueDate: del.deadline,
        projectId: del.project_id,
        projectTitle: del.project?.title || 'Active Project',
        severity: 'high',
      });
    }
  }

  // Overdue tasks
  for (const task of tasks) {
    if (task.due_date && task.due_date < todayStr) {
      attentionItems.push({
        id: `task-${task.id}`,
        type: 'overdue_task',
        title: task.title,
        subtitle: `Task deadline missed (${task.due_date})`,
        dueDate: task.due_date,
        projectId: task.project_id,
        projectTitle: task.project?.title || 'Active Project',
        severity: 'medium',
      });
    }
  }

  // 4. Compute Today Items
  const todayItems: TodayItem[] = [];

  // Today sessions
  for (const ses of sessions) {
    if (ses.date === todayStr && ses.status !== 'cancelled') {
      const timeStr =
        ses.start_time && ses.end_time
          ? `${ses.start_time.slice(0, 5)} - ${ses.end_time.slice(0, 5)}`
          : ses.start_time
            ? `Call time: ${ses.start_time.slice(0, 5)}`
            : undefined;

      todayItems.push({
        id: `ses-${ses.id}`,
        type: 'session',
        title: ses.title,
        subtitle: ses.type.replace('_', ' ').toUpperCase(),
        timeOrStatus: timeStr,
        projectId: ses.project_id,
        projectTitle: ses.project?.title || 'Active Project',
        sessionType: ses.type,
        location: ses.location || undefined,
      });
    }
  }

  // Today tasks
  for (const task of tasks) {
    if (task.due_date === todayStr) {
      todayItems.push({
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        subtitle: 'Due Today',
        projectId: task.project_id,
        projectTitle: task.project?.title || 'Active Project',
        isCompleted: task.status === 'done',
      });
    }
  }

  // Today payments
  for (const pay of payments) {
    if (pay.due_date === todayStr && pay.status === 'pending') {
      todayItems.push({
        id: `pay-${pay.id}`,
        type: 'payment',
        title: pay.label || `${pay.type.toUpperCase()} Payment`,
        subtitle: 'Payment Expected Today',
        projectId: pay.project_id,
        projectTitle: pay.project?.title || 'Active Project',
        amount: pay.amount,
      });
    }
  }

  // 5. Compute Upcoming Sessions (Next 14 Days)
  const upcomingSessions = sessions.filter((s) => s.date >= todayStr && s.status === 'scheduled');

  // 6. Compute Metrics
  const unpaidReceivablesTotal = payments
    .filter((p) => p.status === 'pending')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const receivedRevenueTotal = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const currentMonthPrefix = todayStr.slice(0, 7); // YYYY-MM
  const sessionsScheduledThisMonth = sessions.filter(
    (s) => s.date.startsWith(currentMonthPrefix) && s.status !== 'cancelled'
  ).length;

  return {
    activeProjects,
    attentionItems,
    todayItems,
    upcomingSessions,
    metrics: {
      activeProjectsCount: activeProjects.length,
      unpaidReceivablesTotal,
      receivedRevenueTotal,
      sessionsScheduledThisMonth,
    },
  };
}

export async function fetchWorkspaceCalendarEvents(workspaceId: string): Promise<CalendarEvent[]> {
  const [sessionsRes, deliverablesRes, paymentsRes] = await Promise.all([
    supabase.from('sessions').select('*, project:projects(title)').eq('workspace_id', workspaceId),
    supabase
      .from('deliverables')
      .select('*, project:projects(title)')
      .eq('workspace_id', workspaceId)
      .not('deadline', 'is', null),
    supabase.from('payments').select('*, project:projects(title)').eq('workspace_id', workspaceId),
  ]);

  const events: CalendarEvent[] = [];

  const sessions = (sessionsRes.data || []) as (Session & { project?: { title?: string } })[];
  const deliverables = (deliverablesRes.data || []) as (Deliverable & {
    project?: { title?: string };
  })[];
  const payments = (paymentsRes.data || []) as (Payment & { project?: { title?: string } })[];

  // 1. Sessions
  for (const s of sessions) {
    const timeStr =
      s.start_time && s.end_time
        ? `${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`
        : s.start_time
          ? `Call: ${s.start_time.slice(0, 5)}`
          : undefined;

    events.push({
      id: `ses-${s.id}`,
      type: 'session',
      date: s.date,
      time: timeStr,
      title: s.title,
      projectId: s.project_id,
      projectTitle: s.project?.title || 'Project',
      status: s.status,
      location: s.location || undefined,
      detail: s.type.replace('_', ' ').toUpperCase(),
    });
  }

  // 2. Deliverables
  for (const d of deliverables) {
    if (d.deadline) {
      events.push({
        id: `del-${d.id}`,
        type: 'deliverable',
        date: d.deadline,
        title: d.label,
        projectId: d.project_id,
        projectTitle: d.project?.title || 'Project',
        status: d.status,
        detail: d.type_label || 'DELIVERABLE',
      });
    }
  }

  // 3. Payments
  for (const p of payments) {
    events.push({
      id: `pay-${p.id}`,
      type: 'payment',
      date: p.due_date,
      title: p.label || `${p.type.toUpperCase()} Invoice`,
      projectId: p.project_id,
      projectTitle: p.project?.title || 'Project',
      status: p.status,
      amount: p.amount,
      detail: p.status === 'paid' ? 'Paid' : 'Due',
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
