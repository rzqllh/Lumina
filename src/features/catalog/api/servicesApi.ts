import { supabase } from '@/lib/supabase';
import type { Service, CreateServiceInput, UpdateServiceInput } from '../types/catalogTypes';

export async function fetchServices(
  workspaceId: string,
  activeOnly: boolean = false
): Promise<Service[]> {
  let query = supabase.from('services').select('*').eq('workspace_id', workspaceId);

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  query = query.order('label', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Service[];
}

export async function fetchServiceById(workspaceId: string, serviceId: string): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('id', serviceId)
    .single();

  if (error) throw error;
  return data as Service;
}

export async function createService(input: CreateServiceInput): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .insert({
      workspace_id: input.workspace_id,
      label: input.label,
      default_unit_price: input.default_unit_price ?? 0,
      description: input.description || null,
      is_active: input.is_active ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Service;
}

export async function updateService(
  workspaceId: string,
  serviceId: string,
  input: UpdateServiceInput
): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('workspace_id', workspaceId)
    .eq('id', serviceId)
    .select()
    .single();

  if (error) throw error;
  return data as Service;
}

export async function deleteService(workspaceId: string, serviceId: string): Promise<void> {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('id', serviceId);

  if (error) throw error;
}
