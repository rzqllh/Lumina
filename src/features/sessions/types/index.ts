export type SessionType = 'shoot' | 'meeting' | 'pre_production' | 'event_day' | 'custom';

export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Session {
  id: string;
  workspace_id: string;
  project_id: string;
  type: SessionType;
  custom_type_label: string | null;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string | null; // HH:mm or HH:mm:ss
  end_time: string | null; // HH:mm or HH:mm:ss
  location: string | null;
  notes: string | null;
  status: SessionStatus;
  google_calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionInput {
  workspace_id: string;
  project_id: string;
  type: SessionType;
  custom_type_label?: string | null;
  title: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  notes?: string | null;
  status?: SessionStatus;
}

export interface UpdateSessionInput {
  type?: SessionType;
  custom_type_label?: string | null;
  title?: string;
  date?: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  notes?: string | null;
  status?: SessionStatus;
}
