import { supabase } from '@/lib/supabase';
import type {
  Client,
  ClientListItem,
  ClientWithContacts,
  ClientContact,
  CreateClientInput,
  UpdateClientInput,
  CreateContactInput,
  UpdateContactInput,
} from '../types/clientTypes';

export async function fetchClients(
  workspaceId: string,
  includeArchived = false
): Promise<ClientListItem[]> {
  let query = supabase
    .from('clients')
    .select('*, contacts:client_contacts(id, is_primary)')
    .eq('workspace_id', workspaceId);

  if (!includeArchived) {
    query = query.eq('is_archived', false);
  }

  query = query.order('updated_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ClientListItem[];
}

export async function fetchClientById(
  workspaceId: string,
  clientId: string
): Promise<ClientWithContacts> {
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('id', clientId)
    .single();

  if (clientError) throw clientError;

  const { data: contacts, error: contactsError } = await supabase
    .from('client_contacts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('client_id', clientId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  if (contactsError) throw contactsError;

  return {
    ...(client as Client),
    contacts: (contacts || []) as ClientContact[],
  };
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      workspace_id: input.workspace_id,
      display_name: input.display_name,
      client_type: input.client_type || 'individual',
      custom_type_label: input.custom_type_label || null,
      email: input.email || null,
      phone: input.phone || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

export async function updateClient(
  workspaceId: string,
  clientId: string,
  input: UpdateClientInput
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('workspace_id', workspaceId)
    .eq('id', clientId)
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

export async function deleteClient(workspaceId: string, clientId: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('id', clientId);

  if (error) throw error;
}

export async function createContact(input: CreateContactInput): Promise<ClientContact> {
  // If marked as primary, reset existing primary contacts for this client first
  if (input.is_primary) {
    await supabase
      .from('client_contacts')
      .update({ is_primary: false })
      .eq('workspace_id', input.workspace_id)
      .eq('client_id', input.client_id)
      .eq('is_primary', true);
  }

  const { data, error } = await supabase
    .from('client_contacts')
    .insert({
      workspace_id: input.workspace_id,
      client_id: input.client_id,
      name: input.name,
      role_label: input.role_label || null,
      phone: input.phone || null,
      email: input.email || null,
      notes: input.notes || null,
      is_primary: input.is_primary || false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ClientContact;
}

export async function updateContact(
  workspaceId: string,
  clientId: string,
  contactId: string,
  input: UpdateContactInput
): Promise<ClientContact> {
  // If marked as primary, reset other primary contacts
  if (input.is_primary) {
    await supabase
      .from('client_contacts')
      .update({ is_primary: false })
      .eq('workspace_id', workspaceId)
      .eq('client_id', clientId)
      .neq('id', contactId)
      .eq('is_primary', true);
  }

  const { data, error } = await supabase
    .from('client_contacts')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('workspace_id', workspaceId)
    .eq('id', contactId)
    .select()
    .single();

  if (error) throw error;
  return data as ClientContact;
}

export async function deleteContact(workspaceId: string, contactId: string): Promise<void> {
  const { error } = await supabase
    .from('client_contacts')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('id', contactId);

  if (error) throw error;
}
