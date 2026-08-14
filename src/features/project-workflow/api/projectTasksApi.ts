import { supabase } from '@/lib/supabase';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '../types';

export async function fetchProjectTasks(workspaceId: string, projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, stage:project_workflow_stages(id, label, position, status)')
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as Task[];
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      workspace_id: input.workspace_id,
      project_id: input.project_id,
      stage_id: input.stage_id || null,
      title: input.title,
      due_date: input.due_date || null,
      status: input.status ?? 'open',
      notes: input.notes || null,
    })
    .select('*, stage:project_workflow_stages(id, label, position, status)')
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTask(
  workspaceId: string,
  projectId: string,
  taskId: string,
  input: UpdateTaskInput
): Promise<Task> {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) updatePayload.title = input.title;
  if (input.stage_id !== undefined) updatePayload.stage_id = input.stage_id || null;
  if (input.due_date !== undefined) updatePayload.due_date = input.due_date || null;
  if (input.status !== undefined) updatePayload.status = input.status;
  if (input.notes !== undefined) updatePayload.notes = input.notes || null;

  const { data, error } = await supabase
    .from('tasks')
    .update(updatePayload)
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .eq('id', taskId)
    .select('*, stage:project_workflow_stages(id, label, position, status)')
    .single();

  if (error) throw error;
  return data as Task;
}

export async function toggleTaskStatus(
  workspaceId: string,
  projectId: string,
  taskId: string,
  currentStatus: TaskStatus
): Promise<Task> {
  const newStatus: TaskStatus = currentStatus === 'open' ? 'done' : 'open';
  return updateTask(workspaceId, projectId, taskId, { status: newStatus });
}

export async function deleteTask(
  workspaceId: string,
  projectId: string,
  taskId: string
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .eq('id', taskId);

  if (error) throw error;
}
