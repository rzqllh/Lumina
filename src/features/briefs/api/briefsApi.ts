import { supabase } from '@/lib/supabase';
import type {
  Brief,
  BriefSection,
  BriefField,
  BriefSubmission,
  BriefTemplate,
  CreateBriefSectionInput,
  UpdateBriefSectionInput,
  CreateBriefFieldInput,
  UpdateBriefFieldInput,
  PublicBriefIntakeData,
} from '../types';

// ── Canonical Project Brief ──────────────────────────────────────────────────

export async function fetchProjectBrief(
  workspaceId: string,
  projectId: string
): Promise<Brief | null> {
  const { data, error } = await supabase
    .from('briefs')
    .select(
      `
      *,
      sections:brief_sections(
        *,
        fields:brief_fields(*)
      )
    `
    )
    .eq('workspace_id', workspaceId)
    .eq('project_id', projectId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // Sort sections and their fields by position
  const rawBrief = data as Brief;
  if (rawBrief.sections) {
    rawBrief.sections.sort((a, b) => a.position - b.position);
    for (const sec of rawBrief.sections) {
      if (sec.fields) {
        sec.fields.sort((a, b) => a.position - b.position);
      }
    }
  }

  return rawBrief;
}

// ── Brief Sections CRUD ──────────────────────────────────────────────────────

export async function createBriefSection(input: CreateBriefSectionInput): Promise<BriefSection> {
  const { data, error } = await supabase
    .from('brief_sections')
    .insert({
      brief_id: input.brief_id,
      label: input.label,
      instruction_text: input.instruction_text || null,
      position: input.position ?? 0,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as BriefSection;
}

export async function updateBriefSection(
  sectionId: string,
  input: UpdateBriefSectionInput
): Promise<BriefSection> {
  const updatePayload: Record<string, unknown> = {};
  if (input.label !== undefined) updatePayload.label = input.label;
  if (input.instruction_text !== undefined)
    updatePayload.instruction_text = input.instruction_text || null;
  if (input.position !== undefined) updatePayload.position = input.position;

  const { data, error } = await supabase
    .from('brief_sections')
    .update(updatePayload)
    .eq('id', sectionId)
    .select('*')
    .single();

  if (error) throw error;
  return data as BriefSection;
}

export async function deleteBriefSection(sectionId: string): Promise<void> {
  const { error } = await supabase.from('brief_sections').delete().eq('id', sectionId);
  if (error) throw error;
}

// ── Brief Fields CRUD ────────────────────────────────────────────────────────

export async function createBriefField(input: CreateBriefFieldInput): Promise<BriefField> {
  const { data, error } = await supabase
    .from('brief_fields')
    .insert({
      section_id: input.section_id,
      field_type: input.field_type,
      label: input.label,
      helper_text: input.helper_text || null,
      is_required: input.is_required ?? false,
      visibility: input.visibility ?? 'client_can_fill',
      value: input.value ?? null,
      position: input.position ?? 0,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as BriefField;
}

export async function updateBriefField(
  fieldId: string,
  input: UpdateBriefFieldInput
): Promise<BriefField> {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.field_type !== undefined) updatePayload.field_type = input.field_type;
  if (input.label !== undefined) updatePayload.label = input.label;
  if (input.helper_text !== undefined) updatePayload.helper_text = input.helper_text || null;
  if (input.is_required !== undefined) updatePayload.is_required = input.is_required;
  if (input.visibility !== undefined) updatePayload.visibility = input.visibility;
  if (input.value !== undefined) updatePayload.value = input.value;
  if (input.position !== undefined) updatePayload.position = input.position;

  const { data, error } = await supabase
    .from('brief_fields')
    .update(updatePayload)
    .eq('id', fieldId)
    .select('*')
    .single();

  if (error) throw error;
  return data as BriefField;
}

export async function deleteBriefField(fieldId: string): Promise<void> {
  const { error } = await supabase.from('brief_fields').delete().eq('id', fieldId);
  if (error) throw error;
}

// ── Brief Submissions ────────────────────────────────────────────────────────

export async function fetchBriefSubmissions(briefId: string): Promise<BriefSubmission[]> {
  const { data, error } = await supabase
    .from('brief_submissions')
    .select('*')
    .eq('brief_id', briefId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return (data || []) as BriefSubmission[];
}

// ── Brief Templates ──────────────────────────────────────────────────────────

export async function fetchWorkspaceBriefTemplates(workspaceId: string): Promise<BriefTemplate[]> {
  const { data, error } = await supabase
    .from('brief_templates')
    .select(
      `
      *,
      sections:brief_template_sections(
        *,
        fields:brief_template_fields(*)
      )
    `
    )
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []) as BriefTemplate[];
}

export async function saveBriefAsTemplate(
  workspaceId: string,
  briefId: string,
  templateName: string,
  description?: string
): Promise<BriefTemplate> {
  // 1. Create Template
  const { data: newTmpl, error: tmplErr } = await supabase
    .from('brief_templates')
    .insert({
      workspace_id: workspaceId,
      name: templateName,
      description: description || null,
    })
    .select('*')
    .single();

  if (tmplErr) throw tmplErr;

  // 2. Fetch current brief sections and fields
  const { data: sections, error: secErr } = await supabase
    .from('brief_sections')
    .select('*, fields:brief_fields(*)')
    .eq('brief_id', briefId)
    .order('position', { ascending: true });

  if (secErr) throw secErr;

  // 3. Clone into template
  for (const s of sections || []) {
    const { data: tmplSec, error: tsErr } = await supabase
      .from('brief_template_sections')
      .insert({
        brief_template_id: newTmpl.id,
        label: s.label,
        instruction_text: s.instruction_text,
        position: s.position,
      })
      .select('*')
      .single();

    if (tsErr) throw tsErr;

    for (const f of s.fields || []) {
      await supabase.from('brief_template_fields').insert({
        section_id: tmplSec.id,
        field_type: f.field_type,
        label: f.label,
        helper_text: f.helper_text,
        is_required: f.is_required,
        visibility: f.visibility,
        default_value: f.value,
        position: f.position,
      });
    }
  }

  return newTmpl as BriefTemplate;
}

// ── RPC Procedures ───────────────────────────────────────────────────────────

export async function applyBriefTemplateRpc(briefId: string, templateId: string): Promise<void> {
  const { error } = await supabase.rpc('apply_brief_template', {
    p_brief_id: briefId,
    p_template_id: templateId,
  });

  if (error) throw error;
}

export async function generateBriefShareLinkRpc(
  projectId: string
): Promise<{ link_id: string; raw_token?: string; is_existing: boolean; expires_at: string }> {
  const { data, error } = await supabase.rpc('generate_brief_share_link', {
    p_project_id: projectId,
  });

  if (error) throw error;
  return data;
}

export async function getPublicBriefIntakeRpc(token: string): Promise<PublicBriefIntakeData> {
  const { data, error } = await supabase.rpc('get_public_brief_intake', {
    p_token: token,
  });

  if (error) throw error;
  return data as PublicBriefIntakeData;
}

export async function submitPublicBriefRpc(
  token: string,
  answers: Record<string, unknown>
): Promise<{ success: boolean; submission_id: string; submitted_at: string }> {
  const { data, error } = await supabase.rpc('submit_public_brief', {
    p_token: token,
    p_answers: answers,
  });

  if (error) throw error;
  return data;
}

export async function applyBriefSubmissionReviewRpc(
  submissionId: string,
  acceptedFields: Array<{ field_id: string; value: unknown }>
): Promise<void> {
  const { error } = await supabase.rpc('apply_brief_submission_review', {
    p_submission_id: submissionId,
    p_accepted_fields: acceptedFields,
  });

  if (error) throw error;
}
