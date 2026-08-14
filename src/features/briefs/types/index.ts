export type BriefFieldType =
  | 'short_text'
  | 'long_text'
  | 'rich_text'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime'
  | 'single_select'
  | 'multi_select'
  | 'checkbox'
  | 'checklist'
  | 'location'
  | 'url'
  | 'file_reference'
  | 'schedule_timeline';

export type BriefFieldVisibility =
  'internal_only' | 'client_can_view' | 'client_can_fill' | 'client_must_fill';

export interface BriefField {
  id: string;
  section_id: string;
  field_type: BriefFieldType;
  label: string;
  helper_text: string | null;
  is_required: boolean;
  visibility: BriefFieldVisibility;
  value: unknown;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBriefFieldInput {
  section_id: string;
  field_type: BriefFieldType;
  label: string;
  helper_text?: string | null;
  is_required?: boolean;
  visibility?: BriefFieldVisibility;
  value?: unknown;
  position?: number;
}

export interface UpdateBriefFieldInput {
  field_type?: BriefFieldType;
  label?: string;
  helper_text?: string | null;
  is_required?: boolean;
  visibility?: BriefFieldVisibility;
  value?: unknown;
  position?: number;
}

export interface BriefSection {
  id: string;
  brief_id: string;
  label: string;
  instruction_text: string | null;
  position: number;
  fields?: BriefField[];
  created_at: string;
}

export interface CreateBriefSectionInput {
  brief_id: string;
  label: string;
  instruction_text?: string | null;
  position?: number;
}

export interface UpdateBriefSectionInput {
  label?: string;
  instruction_text?: string | null;
  position?: number;
}

export interface Brief {
  id: string;
  workspace_id: string;
  project_id: string;
  source_template_id: string | null;
  title: string | null;
  sections?: BriefSection[];
  created_at: string;
  updated_at: string;
}

export interface BriefSubmission {
  id: string;
  brief_id: string;
  submitted_values: Record<string, unknown>; // Key: field_id, Value: answer
  submitted_at: string;
  review_status: 'pending' | 'reviewed';
  reviewed_at: string | null;
}

export interface BriefTemplateField {
  id: string;
  section_id: string;
  field_type: BriefFieldType;
  label: string;
  helper_text: string | null;
  is_required: boolean;
  visibility: BriefFieldVisibility;
  default_value: unknown;
  position: number;
  created_at: string;
}

export interface BriefTemplateSection {
  id: string;
  brief_template_id: string;
  label: string;
  instruction_text: string | null;
  position: number;
  fields?: BriefTemplateField[];
  created_at: string;
}

export interface BriefTemplate {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  sections?: BriefTemplateSection[];
  created_at: string;
  updated_at: string;
}

export interface PublicBriefIntakeData {
  project_title: string;
  client_name: string;
  brief_title: string;
  sections: Array<{
    id: string;
    label: string;
    instruction_text: string | null;
    position: number;
    fields: Array<{
      id: string;
      field_type: BriefFieldType;
      label: string;
      helper_text: string | null;
      is_required: boolean;
      visibility: BriefFieldVisibility;
      value: unknown;
      position: number;
    }>;
  }>;
}
