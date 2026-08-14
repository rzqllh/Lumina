import { supabase } from '@/lib/supabase';
import type {
  Project,
  ProjectWithClient,
  CreateProjectInput,
  UpdateProjectInput,
} from '../types/projectTypes';

export async function fetchProjects(
  workspaceId: string,
  statusFilter?: string
): Promise<ProjectWithClient[]> {
  let query = supabase
    .from('projects')
    .select('*, client:clients(id, display_name, client_type, custom_type_label, email, phone)')
    .eq('workspace_id', workspaceId);

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  query = query.order('updated_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as unknown as ProjectWithClient[];
}

export async function fetchProjectById(
  workspaceId: string,
  projectId: string
): Promise<ProjectWithClient> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, client:clients(id, display_name, client_type, custom_type_label, email, phone)')
    .eq('workspace_id', workspaceId)
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data as unknown as ProjectWithClient;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      workspace_id: input.workspace_id,
      client_id: input.client_id,
      title: input.title,
      project_number: input.project_number || null,
      status: input.status || 'active',
      currency: input.currency || 'IDR',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function updateProject(
  workspaceId: string,
  projectId: string,
  input: UpdateProjectInput
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('workspace_id', workspaceId)
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function deleteProject(workspaceId: string, projectId: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('id', projectId);

  if (error) throw error;
}
