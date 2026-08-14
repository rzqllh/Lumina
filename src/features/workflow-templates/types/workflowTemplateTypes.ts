export interface WorkflowTemplateStage {
  id: string;
  workflow_template_id: string;
  label: string;
  position: number;
  created_at: string;
}

export interface WorkflowTemplateStageInput {
  id?: string;
  label: string;
  position: number;
}

export interface WorkflowTemplate {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  workflow_template_stages?: WorkflowTemplateStage[];
}

export interface WorkflowTemplateWithStages extends WorkflowTemplate {
  workflow_template_stages: WorkflowTemplateStage[];
}

export interface CreateWorkflowTemplateInput {
  workspace_id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
  stages: { label: string; position: number }[];
}

export interface UpdateWorkflowTemplateInput {
  name?: string;
  description?: string | null;
  is_active?: boolean;
  stages?: { id?: string; label: string; position: number }[];
}
