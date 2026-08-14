import { supabase } from '@/lib/supabase';
import type { Revision, CreateRevisionInput, UpdateRevisionInput } from '../types';

export async function fetchDeliverableRevisions(
  workspaceId: string,
  deliverableId: string
): Promise<Revision[]> {
  const { data, error } = await supabase
    .from('revisions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('deliverable_id', deliverableId)
    .order('revision_number', { ascending: true });

  if (error) throw error;
  return (data || []) as Revision[];
}

export async function createDeliverableRevision(input: CreateRevisionInput): Promise<Revision> {
  const { data, error } = await supabase.rpc('create_deliverable_revision', {
    p_deliverable_id: input.deliverable_id,
    p_feedback: input.feedback,
    p_due_date: input.due_date || null,
  });

  if (error) throw error;
  return data as Revision;
}

export async function updateRevision(
  workspaceId: string,
  deliverableId: string,
  revisionId: string,
  input: UpdateRevisionInput
): Promise<Revision> {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.status !== undefined) updatePayload.status = input.status;
  if (input.delivered_date !== undefined)
    updatePayload.delivered_date = input.delivered_date || null;
  if (input.notes !== undefined) updatePayload.notes = input.notes || null;

  const { data, error } = await supabase
    .from('revisions')
    .update(updatePayload)
    .eq('workspace_id', workspaceId)
    .eq('deliverable_id', deliverableId)
    .eq('id', revisionId)
    .select('*')
    .single();

  if (error) throw error;
  return data as Revision;
}
