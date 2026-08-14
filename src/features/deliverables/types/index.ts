export type DeliverableStatus =
  'planned' | 'in_progress' | 'delivered' | 'awaiting_review' | 'approved' | 'revision_requested';

export type RevisionStatus =
  'requested' | 'in_progress' | 'delivered' | 'awaiting_review' | 'approved' | 'changes_requested';

export interface Revision {
  id: string;
  workspace_id: string;
  deliverable_id: string;
  revision_number: number;
  requested_date: string; // YYYY-MM-DD
  due_date: string | null; // YYYY-MM-DD
  feedback: string;
  status: RevisionStatus;
  delivered_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: string;
  workspace_id: string;
  project_id: string;
  label: string;
  quantity: number | null;
  type_label: string | null;
  deadline: string | null; // YYYY-MM-DD
  status: DeliverableStatus;
  notes: string | null;
  revisions?: Revision[];
  created_at: string;
  updated_at: string;
}

export interface CreateDeliverableInput {
  workspace_id: string;
  project_id: string;
  label: string;
  quantity?: number | null;
  type_label?: string | null;
  deadline?: string | null;
  status?: DeliverableStatus;
  notes?: string | null;
}

export interface UpdateDeliverableInput {
  label?: string;
  quantity?: number | null;
  type_label?: string | null;
  deadline?: string | null;
  status?: DeliverableStatus;
  notes?: string | null;
}

export interface CreateRevisionInput {
  deliverable_id: string;
  feedback: string;
  due_date?: string | null;
}

export interface UpdateRevisionInput {
  status?: RevisionStatus;
  delivered_date?: string | null;
  notes?: string | null;
}
