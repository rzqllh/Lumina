export type AttentionItemType =
  'overdue_payment' | 'overdue_deliverable' | 'overdue_task' | 'revision_requested';

export interface AttentionItem {
  id: string;
  type: AttentionItemType;
  title: string;
  subtitle: string;
  dueDate: string;
  projectId: string;
  projectTitle: string;
  amount?: number;
  severity: 'high' | 'medium';
}

export type TodayItemType = 'session' | 'task' | 'payment';

export interface TodayItem {
  id: string;
  type: TodayItemType;
  title: string;
  subtitle: string;
  timeOrStatus?: string;
  projectId: string;
  projectTitle: string;
  isCompleted?: boolean;
  amount?: number;
  sessionType?: string;
  location?: string;
}

export interface WorkspaceSummaryMetrics {
  activeProjectsCount: number;
  unpaidReceivablesTotal: number;
  receivedRevenueTotal: number;
  sessionsScheduledThisMonth: number;
}

export type CalendarEventType = 'session' | 'deliverable' | 'revision' | 'payment';

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "09:00 - 14:00"
  title: string;
  projectId: string;
  projectTitle: string;
  status: string;
  amount?: number;
  location?: string;
  detail?: string;
}

export type CalendarCategoryFilter = 'all' | 'sessions' | 'deadlines' | 'payments';
