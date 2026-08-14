export type StageStatus = 'not_started' | 'active' | 'completed' | 'skipped';

export interface ProjectWorkflowStage {
  id: string;
  workspace_id: string;
  project_id: string;
  label: string;
  position: number;
  status: StageStatus;
  source_template_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectStageInput {
  workspace_id: string;
  project_id: string;
  label: string;
  position?: number;
  status?: StageStatus;
}

export interface UpdateProjectStageInput {
  label?: string;
  position?: number;
  status?: StageStatus;
}

export type TaskStatus = 'open' | 'done';

export interface Task {
  id: string;
  workspace_id: string;
  project_id: string;
  stage_id: string | null;
  deliverable_id: string | null;
  title: string;
  due_date: string | null; // ISO Date YYYY-MM-DD
  status: TaskStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  stage?: ProjectWorkflowStage | null;
}

export interface CreateTaskInput {
  workspace_id: string;
  project_id: string;
  stage_id?: string | null;
  title: string;
  due_date?: string | null;
  status?: TaskStatus;
  notes?: string | null;
}

export interface UpdateTaskInput {
  stage_id?: string | null;
  title?: string;
  due_date?: string | null;
  status?: TaskStatus;
  notes?: string | null;
}
