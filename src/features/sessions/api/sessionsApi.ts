import { supabase } from '@/lib/supabase';
import type { Session, CreateSessionInput, UpdateSessionInput, SessionStatus } from '../types';

export async function fetchProjectSessions(
  workspaceId: string,
  projectId: string
): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data || []) as Session[];
}

export async function createSession(input: CreateSessionInput): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      workspace_id: input.workspace_id,
      project_id: input.project_id,
      type: input.type,
      custom_type_label: input.custom_type_label || null,
      title: input.title,
      date: input.date,
      start_time: input.start_time || null,
      end_time: input.end_time || null,
      location: input.location || null,
      notes: input.notes || null,
      status: input.status ?? 'scheduled',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Session;
}

export async function updateSession(
  workspaceId: string,
  projectId: string,
  sessionId: string,
  input: UpdateSessionInput
): Promise<Session> {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.type !== undefined) updatePayload.type = input.type;
  if (input.custom_type_label !== undefined)
    updatePayload.custom_type_label = input.custom_type_label || null;
  if (input.title !== undefined) updatePayload.title = input.title;
  if (input.date !== undefined) updatePayload.date = input.date;
  if (input.start_time !== undefined) updatePayload.start_time = input.start_time || null;
  if (input.end_time !== undefined) updatePayload.end_time = input.end_time || null;
  if (input.location !== undefined) updatePayload.location = input.location || null;
  if (input.notes !== undefined) updatePayload.notes = input.notes || null;
  if (input.status !== undefined) updatePayload.status = input.status;

  const { data, error } = await supabase
    .from('sessions')
    .update(updatePayload)
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .eq('id', sessionId)
    .select('*')
    .single();

  if (error) throw error;
  return data as Session;
}

export async function updateSessionStatus(
  workspaceId: string,
  projectId: string,
  sessionId: string,
  status: SessionStatus
): Promise<Session> {
  return updateSession(workspaceId, projectId, sessionId, { status });
}

export async function deleteSession(
  workspaceId: string,
  projectId: string,
  sessionId: string
): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .eq('id', sessionId);

  if (error) throw error;
}
