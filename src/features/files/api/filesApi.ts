import { supabase } from '@/lib/supabase';
import type {
  FileReference,
  CreateFileReferenceInput,
  UpdateFileReferenceInput,
  PublicStatusPortalData,
} from '../types';

export async function fetchProjectFileReferences(
  workspaceId: string,
  projectId: string
): Promise<FileReference[]> {
  const { data, error } = await supabase
    .from('file_references')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as FileReference[];
}

export async function createFileReference(input: CreateFileReferenceInput): Promise<FileReference> {
  const { data, error } = await supabase
    .from('file_references')
    .insert({
      workspace_id: input.workspace_id,
      project_id: input.project_id,
      deliverable_id: input.deliverable_id || null,
      revision_id: input.revision_id || null,
      provider: input.provider,
      display_name: input.display_name,
      url_or_path: input.url_or_path,
      mime_type: input.mime_type || null,
      size_bytes: input.size_bytes || null,
      is_client_visible: input.is_client_visible ?? true,
      notes: input.notes || null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as FileReference;
}

export async function updateFileReference(
  fileId: string,
  input: UpdateFileReferenceInput
): Promise<FileReference> {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.deliverable_id !== undefined) updatePayload.deliverable_id = input.deliverable_id;
  if (input.provider !== undefined) updatePayload.provider = input.provider;
  if (input.display_name !== undefined) updatePayload.display_name = input.display_name;
  if (input.url_or_path !== undefined) updatePayload.url_or_path = input.url_or_path;
  if (input.is_client_visible !== undefined)
    updatePayload.is_client_visible = input.is_client_visible;
  if (input.notes !== undefined) updatePayload.notes = input.notes || null;

  const { data, error } = await supabase
    .from('file_references')
    .update(updatePayload)
    .eq('id', fileId)
    .select('*')
    .single();

  if (error) throw error;
  return data as FileReference;
}

export async function deleteFileReference(fileId: string): Promise<void> {
  const { error } = await supabase.from('file_references').delete().eq('id', fileId);
  if (error) throw error;
}

// ── RPC Procedures ───────────────────────────────────────────────────────────

export async function generateProjectStatusShareLinkRpc(
  projectId: string
): Promise<{ link_id: string; raw_token?: string; is_existing: boolean; expires_at: string }> {
  const { data, error } = await supabase.rpc('generate_project_status_share_link', {
    p_project_id: projectId,
  });

  if (error) throw error;
  return data;
}

export async function revokeProjectShareLinkRpc(linkId: string): Promise<void> {
  const { error } = await supabase.rpc('revoke_project_share_link', {
    p_link_id: linkId,
  });

  if (error) throw error;
}

export async function getPublicProjectStatusRpc(token: string): Promise<PublicStatusPortalData> {
  const { data, error } = await supabase.rpc('get_public_project_status', {
    p_token: token,
  });

  if (error) throw error;
  return data as PublicStatusPortalData;
}
