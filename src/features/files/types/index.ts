export type FileProvider = 'app_storage' | 'google_drive' | 'external_url';

export interface FileReference {
  id: string;
  workspace_id: string;
  project_id: string;
  deliverable_id: string | null;
  revision_id: string | null;
  provider: FileProvider;
  display_name: string;
  url_or_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  is_client_visible: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFileReferenceInput {
  workspace_id: string;
  project_id: string;
  deliverable_id?: string | null;
  revision_id?: string | null;
  provider: FileProvider;
  display_name: string;
  url_or_path: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  is_client_visible?: boolean;
  notes?: string | null;
}

export interface UpdateFileReferenceInput {
  deliverable_id?: string | null;
  provider?: FileProvider;
  display_name?: string;
  url_or_path?: string;
  is_client_visible?: boolean;
  notes?: string | null;
}

export interface PublicStatusPortalData {
  project: {
    id: string;
    title: string;
    project_number: string | null;
    status: string;
    currency: string;
  };
  client: {
    display_name: string;
  };
  stages: Array<{
    id: string;
    label: string;
    position: number;
    status: 'not_started' | 'active' | 'completed' | 'skipped';
  }>;
  sessions: Array<{
    id: string;
    type: string;
    custom_type_label: string | null;
    title: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    status: 'scheduled' | 'completed' | 'cancelled';
  }>;
  deliverables: Array<{
    id: string;
    label: string;
    quantity: number | null;
    type_label: string | null;
    status: string;
    deadline: string | null;
    files: Array<{
      id: string;
      provider: FileProvider;
      display_name: string;
      url_or_path: string;
    }>;
  }>;
  general_files: Array<{
    id: string;
    provider: FileProvider;
    display_name: string;
    url_or_path: string;
  }>;
}
