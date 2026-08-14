import { supabase } from '@/lib/supabase';
import type {
  ProjectWorkflowStage,
  CreateProjectStageInput,
  UpdateProjectStageInput,
  StageStatus,
} from '../types';

export async function fetchProjectStages(
  workspaceId: string,
  projectId: string
): Promise<ProjectWorkflowStage[]> {
  const { data, error } = await supabase
    .from('project_workflow_stages')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .order('position', { ascending: true });

  if (error) throw error;
  return (data || []) as ProjectWorkflowStage[];
}

export async function createProjectStage(
  input: CreateProjectStageInput
): Promise<ProjectWorkflowStage> {
  // If position is not provided, find the max position
  let pos = input.position;
  if (pos === undefined) {
    const { data: existing } = await supabase
      .from('project_workflow_stages')
      .select('position')
      .eq('project_id', input.project_id)
      .order('position', { ascending: false })
      .limit(1);

    pos = existing && existing.length > 0 ? (existing[0].position ?? 0) + 1 : 0;
  }

  const { data, error } = await supabase
    .from('project_workflow_stages')
    .insert({
      workspace_id: input.workspace_id,
      project_id: input.project_id,
      label: input.label,
      position: pos,
      status: input.status ?? 'not_started',
    })
    .select()
    .single();

  if (error) throw error;
  return data as ProjectWorkflowStage;
}

export async function updateProjectStage(
  workspaceId: string,
  projectId: string,
  stageId: string,
  input: UpdateProjectStageInput
): Promise<ProjectWorkflowStage> {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.label !== undefined) updatePayload.label = input.label;
  if (input.position !== undefined) updatePayload.position = input.position;
  if (input.status !== undefined) updatePayload.status = input.status;

  const { data, error } = await supabase
    .from('project_workflow_stages')
    .update(updatePayload)
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .eq('id', stageId)
    .select()
    .single();

  if (error) throw error;
  return data as ProjectWorkflowStage;
}

export async function updateStageStatus(
  workspaceId: string,
  projectId: string,
  stageId: string,
  status: StageStatus
): Promise<ProjectWorkflowStage> {
  return updateProjectStage(workspaceId, projectId, stageId, { status });
}

export async function reorderProjectStages(
  workspaceId: string,
  projectId: string,
  stageOrders: { id: string; position: number }[]
): Promise<void> {
  const updates = stageOrders.map((item) =>
    supabase
      .from('project_workflow_stages')
      .update({ position: item.position, updated_at: new Date().toISOString() })
      .eq('workspace_id', workspaceId)
      .eq('project_id', projectId)
      .eq('id', item.id)
  );

  const results = await Promise.all(updates);
  for (const res of results) {
    if (res.error) throw res.error;
  }
}

export async function deleteProjectStage(
  workspaceId: string,
  projectId: string,
  stageId: string
): Promise<void> {
  const { error } = await supabase
    .from('project_workflow_stages')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .eq('id', stageId);

  if (error) throw error;
}

export async function applyWorkflowTemplate(
  projectId: string,
  templateId: string,
  mode: 'replace' | 'append' = 'append'
): Promise<ProjectWorkflowStage[]> {
  const { data, error } = await supabase.rpc('apply_workflow_template_to_project', {
    p_project_id: projectId,
    p_template_id: templateId,
    p_mode: mode,
  });

  if (error) throw error;
  return (data || []) as ProjectWorkflowStage[];
}
