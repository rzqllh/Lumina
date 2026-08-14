import { supabase } from '@/lib/supabase';
import type {
  ProjectService,
  AddServiceSnapshotInput,
  AddCustomLineInput,
  UpdateProjectServiceInput,
} from '../types/projectPricingTypes';

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchProjectServices(
  workspaceId: string,
  projectId: string,
): Promise<ProjectService[]> {
  const { data, error } = await supabase
    .from('project_services')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as ProjectService[]) ?? [];
}

// ─── Add Service Snapshot (from catalog Service) ──────────────────────────────

export async function addServiceSnapshot(
  input: AddServiceSnapshotInput,
): Promise<ProjectService> {
  const subtotal = input.quantity * input.unit_price;

  const { data, error } = await supabase
    .from('project_services')
    .insert({
      workspace_id: input.workspace_id,
      project_id: input.project_id,
      label: input.label,
      description: input.description ?? null,
      quantity: input.quantity,
      unit_price: input.unit_price,
      subtotal,
      adjustment_label: null,
      adjustment_amount: 0,
      source_service_id: input.source_service_id ?? null,
      source_package_id: null,
      position: input.position ?? 0,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as ProjectService;
}

// ─── Add Custom Line (no catalog source) ─────────────────────────────────────

export async function addCustomLine(
  input: AddCustomLineInput,
): Promise<ProjectService> {
  const subtotal = input.quantity * input.unit_price;

  const { data, error } = await supabase
    .from('project_services')
    .insert({
      workspace_id: input.workspace_id,
      project_id: input.project_id,
      label: input.label,
      description: input.description ?? null,
      quantity: input.quantity,
      unit_price: input.unit_price,
      subtotal,
      adjustment_label: null,
      adjustment_amount: 0,
      source_service_id: null,
      source_package_id: null,
      position: input.position ?? 0,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as ProjectService;
}

// ─── Update Project Service Snapshot ─────────────────────────────────────────

export async function updateProjectService(
  id: string,
  workspaceId: string,
  input: UpdateProjectServiceInput,
): Promise<ProjectService> {
  const updates: Record<string, unknown> = { ...input };

  // Recompute subtotal whenever quantity or unit_price changes
  if (input.quantity !== undefined || input.unit_price !== undefined) {
    // We need both to recompute; fetch existing if only one changed.
    // Since the form always submits both, we can rely on both being present.
    if (input.quantity !== undefined && input.unit_price !== undefined) {
      updates.subtotal = input.quantity * input.unit_price;
    }
  }

  const { data, error } = await supabase
    .from('project_services')
    .update(updates)
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as ProjectService;
}

// ─── Remove Project Service ───────────────────────────────────────────────────

export async function removeProjectService(
  id: string,
  workspaceId: string,
): Promise<void> {
  const { error } = await supabase
    .from('project_services')
    .delete()
    .eq('id', id)
    .eq('workspace_id', workspaceId);

  if (error) throw new Error(error.message);
}

// ─── Apply Package via RPC (atomic) ──────────────────────────────────────────

export async function applyPackageToProject(
  workspaceId: string,
  projectId: string,
  packageId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc('apply_package_to_project', {
    p_workspace_id: workspaceId,
    p_project_id: projectId,
    p_package_id: packageId,
  });

  if (error) throw new Error(error.message);
  return (data as number) ?? 0;
}
