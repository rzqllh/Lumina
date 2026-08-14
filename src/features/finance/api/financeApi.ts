import { supabase } from '@/lib/supabase';
import type {
  Payment,
  CreatePaymentInput,
  UpdatePaymentInput,
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  Collaborator,
  CollaboratorEngagement,
  CreateCollaboratorEngagementInput,
  UpdateCollaboratorEngagementInput,
} from '../types';
import type { Project } from '@/features/projects';

// ── Payments ─────────────────────────────────────────────────────────────────

export async function fetchProjectPayments(
  workspaceId: string,
  projectId: string
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .order('due_date', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as Payment[];
}

export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      workspace_id: input.workspace_id,
      project_id: input.project_id,
      type: input.type,
      label: input.label || null,
      amount: input.amount,
      due_date: input.due_date,
      status: input.status ?? 'pending',
      paid_date: input.paid_date || null,
      payment_method: input.payment_method || null,
      notes: input.notes || null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Payment;
}

export async function updatePayment(
  workspaceId: string,
  projectId: string,
  paymentId: string,
  input: UpdatePaymentInput
): Promise<Payment> {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.type !== undefined) updatePayload.type = input.type;
  if (input.label !== undefined) updatePayload.label = input.label || null;
  if (input.amount !== undefined) updatePayload.amount = input.amount;
  if (input.due_date !== undefined) updatePayload.due_date = input.due_date;
  if (input.status !== undefined) updatePayload.status = input.status;
  if (input.paid_date !== undefined) updatePayload.paid_date = input.paid_date || null;
  if (input.payment_method !== undefined)
    updatePayload.payment_method = input.payment_method || null;
  if (input.notes !== undefined) updatePayload.notes = input.notes || null;

  const { data, error } = await supabase
    .from('payments')
    .update(updatePayload)
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .eq('id', paymentId)
    .select('*')
    .single();

  if (error) throw error;
  return data as Payment;
}

export async function deletePayment(
  workspaceId: string,
  projectId: string,
  paymentId: string
): Promise<void> {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .eq('id', paymentId);

  if (error) throw error;
}

// ── Expenses ─────────────────────────────────────────────────────────────────

export async function fetchProjectExpenses(
  workspaceId: string,
  projectId: string
): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []) as Expense[];
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      workspace_id: input.workspace_id,
      project_id: input.project_id,
      label: input.label,
      amount: input.amount,
      date: input.date,
      category: input.category || null,
      notes: input.notes || null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function updateExpense(
  workspaceId: string,
  projectId: string,
  expenseId: string,
  input: UpdateExpenseInput
): Promise<Expense> {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.label !== undefined) updatePayload.label = input.label;
  if (input.amount !== undefined) updatePayload.amount = input.amount;
  if (input.date !== undefined) updatePayload.date = input.date;
  if (input.category !== undefined) updatePayload.category = input.category || null;
  if (input.notes !== undefined) updatePayload.notes = input.notes || null;

  const { data, error } = await supabase
    .from('expenses')
    .update(updatePayload)
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .eq('id', expenseId)
    .select('*')
    .single();

  if (error) throw error;
  return data as Expense;
}

export async function deleteExpense(
  workspaceId: string,
  projectId: string,
  expenseId: string
): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .eq('id', expenseId);

  if (error) throw error;
}

// ── Collaborators & Engagements ──────────────────────────────────────────────

export async function fetchWorkspaceCollaborators(workspaceId: string): Promise<Collaborator[]> {
  const { data, error } = await supabase
    .from('collaborators')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []) as Collaborator[];
}

export async function fetchProjectCollaboratorEngagements(
  workspaceId: string,
  projectId: string
): Promise<CollaboratorEngagement[]> {
  const { data, error } = await supabase
    .from('collaborator_engagements')
    .select('*, collaborator:collaborators(*)')
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as CollaboratorEngagement[];
}

export async function createCollaboratorEngagement(
  input: CreateCollaboratorEngagementInput
): Promise<CollaboratorEngagement> {
  const { data, error } = await supabase
    .from('collaborator_engagements')
    .insert({
      workspace_id: input.workspace_id,
      project_id: input.project_id,
      collaborator_id: input.collaborator_id,
      role_label: input.role_label,
      agreed_fee: input.agreed_fee,
      payment_status: input.payment_status ?? 'unpaid',
      paid_amount: input.paid_amount ?? 0,
      notes: input.notes || null,
    })
    .select('*, collaborator:collaborators(*)')
    .single();

  if (error) throw error;
  return data as CollaboratorEngagement;
}

export async function updateCollaboratorEngagement(
  workspaceId: string,
  projectId: string,
  engagementId: string,
  input: UpdateCollaboratorEngagementInput
): Promise<CollaboratorEngagement> {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.role_label !== undefined) updatePayload.role_label = input.role_label;
  if (input.agreed_fee !== undefined) updatePayload.agreed_fee = input.agreed_fee;
  if (input.payment_status !== undefined) updatePayload.payment_status = input.payment_status;
  if (input.paid_amount !== undefined) updatePayload.paid_amount = input.paid_amount;
  if (input.notes !== undefined) updatePayload.notes = input.notes || null;

  const { data, error } = await supabase
    .from('collaborator_engagements')
    .update(updatePayload)
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .eq('id', engagementId)
    .select('*, collaborator:collaborators(*)')
    .single();

  if (error) throw error;
  return data as CollaboratorEngagement;
}

export async function deleteCollaboratorEngagement(
  workspaceId: string,
  projectId: string,
  engagementId: string
): Promise<void> {
  const { error } = await supabase
    .from('collaborator_engagements')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .eq('id', engagementId);

  if (error) throw error;
}

// ── Project Closure RPCs ─────────────────────────────────────────────────────

export async function closeProjectRpc(projectId: string): Promise<Project> {
  const { data, error } = await supabase.rpc('close_project', {
    p_project_id: projectId,
  });

  if (error) throw error;
  return data as Project;
}

export async function forceCloseProjectRpc(projectId: string, reason: string): Promise<Project> {
  const { data, error } = await supabase.rpc('force_close_project', {
    p_project_id: projectId,
    p_reason: reason,
  });

  if (error) throw error;
  return data as Project;
}

export async function reopenProjectRpc(projectId: string): Promise<Project> {
  const { data, error } = await supabase.rpc('reopen_project', {
    p_project_id: projectId,
  });

  if (error) throw error;
  return data as Project;
}
