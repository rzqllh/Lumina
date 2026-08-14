import { supabase } from '@/lib/supabase';
import type {
  Deliverable,
  CreateDeliverableInput,
  UpdateDeliverableInput,
  DeliverableStatus,
} from '../types';

export async function fetchProjectDeliverables(
  workspaceId: string,
  projectId: string
): Promise<Deliverable[]> {
  const { data, error } = await supabase
    .from('deliverables')
    .select('*, revisions(*)')
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .order('deadline', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as Deliverable[];
}

export async function createDeliverable(input: CreateDeliverableInput): Promise<Deliverable> {
  const { data, error } = await supabase
    .from('deliverables')
    .insert({
      workspace_id: input.workspace_id,
      project_id: input.project_id,
      label: input.label,
      quantity: input.quantity ?? null,
      type_label: input.type_label ?? null,
      deadline: input.deadline || null,
      status: input.status ?? 'planned',
      notes: input.notes || null,
    })
    .select('*, revisions(*)')
    .single();

  if (error) throw error;
  return data as Deliverable;
}

export async function updateDeliverable(
  workspaceId: string,
  projectId: string,
  deliverableId: string,
  input: UpdateDeliverableInput
): Promise<Deliverable> {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.label !== undefined) updatePayload.label = input.label;
  if (input.quantity !== undefined) updatePayload.quantity = input.quantity;
  if (input.type_label !== undefined) updatePayload.type_label = input.type_label;
  if (input.deadline !== undefined) updatePayload.deadline = input.deadline || null;
  if (input.status !== undefined) updatePayload.status = input.status;
  if (input.notes !== undefined) updatePayload.notes = input.notes || null;

  const { data, error } = await supabase
    .from('deliverables')
    .update(updatePayload)
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .eq('id', deliverableId)
    .select('*, revisions(*)')
    .single();

  if (error) throw error;
  return data as Deliverable;
}

export async function updateDeliverableStatus(
  workspaceId: string,
  projectId: string,
  deliverableId: string,
  status: DeliverableStatus
): Promise<Deliverable> {
  return updateDeliverable(workspaceId, projectId, deliverableId, { status });
}

export async function deleteDeliverable(
  workspaceId: string,
  projectId: string,
  deliverableId: string
): Promise<void> {
  const { error } = await supabase
    .from('deliverables')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .eq('id', deliverableId);

  if (error) throw error;
}
