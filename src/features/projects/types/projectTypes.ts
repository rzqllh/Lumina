export type ProjectStatus = 'draft' | 'active' | 'closed' | 'force_closed' | 'archived';

export interface Project {
  id: string;
  workspace_id: string;
  client_id: string;
  title: string;
  project_number: string | null;
  status: ProjectStatus;
  currency: string;
  client_approved_at: string | null;
  closed_at: string | null;
  force_closed_at: string | null;
  force_close_reason: string | null;
  reopened_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectClientSummary {
  id: string;
  display_name: string;
  client_type: string;
  custom_type_label?: string | null;
  email: string | null;
  phone: string | null;
}

export interface ProjectWithClient extends Project {
  client: ProjectClientSummary;
}

export interface CreateProjectInput {
  workspace_id: string;
  client_id: string;
  title: string;
  project_number?: string | null;
  status?: ProjectStatus;
  currency?: string;
}

export interface UpdateProjectInput {
  client_id?: string;
  title?: string;
  project_number?: string | null;
  status?: ProjectStatus;
  currency?: string;
}
