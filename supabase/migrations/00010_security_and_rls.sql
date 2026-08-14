-- Migration 00010: Security and Row Level Security (RLS)
-- Enforces workspace isolation and denies anonymous direct table access

-- Enable RLS across all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_template_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_submission_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborator_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_share_links ENABLE ROW LEVEL SECURITY;

-- 1. workspaces & workspace_members policies
CREATE POLICY "Users can view workspaces they belong to"
ON workspaces FOR SELECT TO authenticated
USING (is_workspace_member(id));

CREATE POLICY "Users can update workspaces they own"
ON workspaces FOR UPDATE TO authenticated
USING (is_workspace_member(id))
WITH CHECK (is_workspace_member(id));

CREATE POLICY "Users can view members in their workspace"
ON workspace_members FOR SELECT TO authenticated
USING (is_workspace_member(workspace_id));

-- 2. Direct workspace_id scoped tables
CREATE POLICY "Workspace members full access to clients"
ON clients FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to client_contacts"
ON client_contacts FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to project_contacts"
ON project_contacts FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to services"
ON services FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to packages"
ON packages FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to package_items"
ON package_items FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM packages p
    WHERE p.id = package_items.package_id
      AND is_workspace_member(p.workspace_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM packages p
    WHERE p.id = package_items.package_id
      AND is_workspace_member(p.workspace_id)
));

CREATE POLICY "Workspace members full access to project_services"
ON project_services FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to projects"
ON projects FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to sessions"
ON sessions FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to workflow_templates"
ON workflow_templates FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to workflow_template_stages"
ON workflow_template_stages FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM workflow_templates wt
    WHERE wt.id = workflow_template_stages.workflow_template_id
      AND is_workspace_member(wt.workspace_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM workflow_templates wt
    WHERE wt.id = workflow_template_stages.workflow_template_id
      AND is_workspace_member(wt.workspace_id)
));

CREATE POLICY "Workspace members full access to project_workflow_stages"
ON project_workflow_stages FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to tasks"
ON tasks FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to brief_templates"
ON brief_templates FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to brief_template_sections"
ON brief_template_sections FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM brief_templates bt
    WHERE bt.id = brief_template_sections.brief_template_id
      AND is_workspace_member(bt.workspace_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM brief_templates bt
    WHERE bt.id = brief_template_sections.brief_template_id
      AND is_workspace_member(bt.workspace_id)
));

CREATE POLICY "Workspace members full access to brief_template_fields"
ON brief_template_fields FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM brief_template_sections bts
    JOIN brief_templates bt ON bt.id = bts.brief_template_id
    WHERE bts.id = brief_template_fields.section_id
      AND is_workspace_member(bt.workspace_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM brief_template_sections bts
    JOIN brief_templates bt ON bt.id = bts.brief_template_id
    WHERE bts.id = brief_template_fields.section_id
      AND is_workspace_member(bt.workspace_id)
));

CREATE POLICY "Workspace members full access to briefs"
ON briefs FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to brief_sections"
ON brief_sections FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM briefs b
    WHERE b.id = brief_sections.brief_id
      AND is_workspace_member(b.workspace_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM briefs b
    WHERE b.id = brief_sections.brief_id
      AND is_workspace_member(b.workspace_id)
));

CREATE POLICY "Workspace members full access to brief_fields"
ON brief_fields FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM brief_sections bs
    JOIN briefs b ON b.id = bs.brief_id
    WHERE bs.id = brief_fields.section_id
      AND is_workspace_member(b.workspace_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM brief_sections bs
    JOIN briefs b ON b.id = bs.brief_id
    WHERE bs.id = brief_fields.section_id
      AND is_workspace_member(b.workspace_id)
));

CREATE POLICY "Workspace members can view and update submissions"
ON brief_submissions FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM briefs b
    WHERE b.id = brief_submissions.brief_id
      AND is_workspace_member(b.workspace_id)
));

CREATE POLICY "Workspace members full access to brief_submission_reviews"
ON brief_submission_reviews FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM brief_submissions bs
    JOIN briefs b ON b.id = bs.brief_id
    WHERE bs.id = brief_submission_reviews.submission_id
      AND is_workspace_member(b.workspace_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM brief_submissions bs
    JOIN briefs b ON b.id = bs.brief_id
    WHERE bs.id = brief_submission_reviews.submission_id
      AND is_workspace_member(b.workspace_id)
));

CREATE POLICY "Workspace members full access to deliverables"
ON deliverables FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to revisions"
ON revisions FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to payments"
ON payments FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to expenses"
ON expenses FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to collaborators"
ON collaborators FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to collaborator_engagements"
ON collaborator_engagements FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to file_references"
ON file_references FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));

CREATE POLICY "Workspace members full access to public_share_links"
ON public_share_links FOR ALL TO authenticated
USING (is_workspace_member(workspace_id))
WITH CHECK (is_workspace_member(workspace_id));
