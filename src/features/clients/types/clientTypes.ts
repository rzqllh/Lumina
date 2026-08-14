export type ClientType = 'individual' | 'couple' | 'organization' | 'custom';

export interface Client {
  id: string;
  workspace_id: string;
  display_name: string;
  client_type: ClientType;
  custom_type_label: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientContact {
  id: string;
  workspace_id: string;
  client_id: string;
  name: string;
  role_label: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientWithContacts extends Client {
  contacts: ClientContact[];
}

export interface ClientListItem extends Client {
  contacts?: Array<{ id: string; is_primary: boolean }>;
}

export interface CreateClientInput {
  workspace_id: string;
  display_name: string;
  client_type?: ClientType;
  custom_type_label?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
}

export interface UpdateClientInput {
  display_name?: string;
  client_type?: ClientType;
  custom_type_label?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  is_archived?: boolean;
}

export interface CreateContactInput {
  workspace_id: string;
  client_id: string;
  name: string;
  role_label?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  is_primary?: boolean;
}

export interface UpdateContactInput {
  name?: string;
  role_label?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  is_primary?: boolean;
}
