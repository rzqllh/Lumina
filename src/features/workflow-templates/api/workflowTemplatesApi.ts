import { supabase } from '@/lib/supabase';
import type {
  WorkflowTemplateStage,
  WorkflowTemplateWithStages,
  CreateWorkflowTemplateInput,
  UpdateWorkflowTemplateInput,
} from '../types/workflowTemplateTypes';

export async function fetchWorkflowTemplates(
  workspaceId: string,
  activeOnly: boolean = false
): Promise<WorkflowTemplateWithStages[]> {
  let query = supabase
    .from('workflow_templates')
    .select('*, workflow_template_stages(*)')
    .eq('workspace_id', workspaceId);

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  query = query.order('name', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((tmpl) => {
    const stages = (tmpl.workflow_template_stages || []) as WorkflowTemplateStage[];
    stages.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return {
      ...tmpl,
      workflow_template_stages: stages,
    } as WorkflowTemplateWithStages;
  });
}

export async function fetchWorkflowTemplateById(
  workspaceId: string,
  templateId: string
): Promise<WorkflowTemplateWithStages> {
  const { data, error } = await supabase
    .from('workflow_templates')
    .select('*, workflow_template_stages(*)')
    .eq('workspace_id', workspaceId)
    .eq('id', templateId)
    .single();

  if (error) throw error;

  const stages = (data.workflow_template_stages || []) as WorkflowTemplateStage[];
  stages.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return {
    ...data,
    workflow_template_stages: stages,
  } as WorkflowTemplateWithStages;
}

export async function createWorkflowTemplate(
  input: CreateWorkflowTemplateInput
): Promise<WorkflowTemplateWithStages> {
  const { data: template, error: templateError } = await supabase
    .from('workflow_templates')
    .insert({
      workspace_id: input.workspace_id,
      name: input.name,
      description: input.description ?? null,
      is_active: input.is_active ?? true,
    })
    .select()
    .single();

  if (templateError) throw templateError;

  const stageRows = (input.stages || []).map((stage, idx) => ({
    workflow_template_id: template.id,
    label: stage.label,
    position: stage.position ?? idx,
  }));

  if (stageRows.length > 0) {
    const { data: insertedStages, error: stagesError } = await supabase
      .from('workflow_template_stages')
      .insert(stageRows)
      .select();

    if (stagesError) throw stagesError;

    const stages = (insertedStages || []) as WorkflowTemplateStage[];
    stages.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    return {
      ...template,
      workflow_template_stages: stages,
    };
  }

  return {
    ...template,
    workflow_template_stages: [],
  };
}

export async function updateWorkflowTemplate(
  workspaceId: string,
  templateId: string,
  input: UpdateWorkflowTemplateInput
): Promise<WorkflowTemplateWithStages> {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.name !== undefined) updatePayload.name = input.name;
  if (input.description !== undefined) updatePayload.description = input.description;
  if (input.is_active !== undefined) updatePayload.is_active = input.is_active;

  const { data: template, error: templateError } = await supabase
    .from('workflow_templates')
    .update(updatePayload)
    .eq('workspace_id', workspaceId)
    .eq('id', templateId)
    .select()
    .single();

  if (templateError) throw templateError;

  if (input.stages !== undefined) {
    // Delete existing stages and insert new stages to maintain ordered list
    const { error: deleteError } = await supabase
      .from('workflow_template_stages')
      .delete()
      .eq('workflow_template_id', templateId);

    if (deleteError) throw deleteError;

    const stageRows = input.stages.map((stage, idx) => ({
      workflow_template_id: templateId,
      label: stage.label,
      position: stage.position ?? idx,
    }));

    if (stageRows.length > 0) {
      const { data: insertedStages, error: stagesError } = await supabase
        .from('workflow_template_stages')
        .insert(stageRows)
        .select();

      if (stagesError) throw stagesError;

      const stages = (insertedStages || []) as WorkflowTemplateStage[];
      stages.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

      return {
        ...template,
        workflow_template_stages: stages,
      };
    }
  }

  return fetchWorkflowTemplateById(workspaceId, templateId);
}

export async function deleteWorkflowTemplate(
  workspaceId: string,
  templateId: string
): Promise<void> {
  const { error } = await supabase
    .from('workflow_templates')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('id', templateId);

  if (error) throw error;
}

export async function duplicateWorkflowTemplate(
  workspaceId: string,
  templateId: string
): Promise<WorkflowTemplateWithStages> {
  const source = await fetchWorkflowTemplateById(workspaceId, templateId);

  return createWorkflowTemplate({
    workspace_id: workspaceId,
    name: `${source.name} (Copy)`,
    description: source.description,
    is_active: source.is_active,
    stages: source.workflow_template_stages.map((s, idx) => ({
      label: s.label,
      position: s.position ?? idx,
    })),
  });
}
