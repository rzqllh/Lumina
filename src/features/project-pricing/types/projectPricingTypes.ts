// Project-owned pricing snapshot types (INV-001, INV-015)
// These are NOT catalog types — they belong to the project-pricing feature.

export interface ProjectService {
  id: string;
  workspace_id: string;
  project_id: string;
  label: string;
  description: string | null;
  quantity: number;
  unit_price: number; // BIGINT minor units (IDR)
  subtotal: number; // quantity × unit_price, stored at write time
  adjustment_label: string | null;
  adjustment_amount: number; // signed BIGINT; negative = discount
  source_package_id: string | null; // audit ref only — NOT a live binding
  source_service_id: string | null; // audit ref only — NOT a live binding
  position: number;
  created_at: string;
  updated_at: string;
}

// Net line total is computed in the frontend; not stored in the database.
// net_line_total = subtotal + adjustment_amount
export function computeNetLineTotal(ps: ProjectService): number {
  return ps.subtotal + ps.adjustment_amount;
}

// Project Value = SUM of all net line totals for a given project.
export function computeProjectValue(projectServices: ProjectService[]): number {
  return projectServices.reduce((acc, ps) => acc + computeNetLineTotal(ps), 0);
}

// ─── Input Types ──────────────────────────────────────────────────────────────

export interface AddServiceSnapshotInput {
  workspace_id: string;
  project_id: string;
  label: string;
  description?: string | null;
  quantity: number;
  unit_price: number;
  source_service_id?: string | null;
  position?: number;
}

export interface AddCustomLineInput {
  workspace_id: string;
  project_id: string;
  label: string;
  description?: string | null;
  quantity: number;
  unit_price: number;
  position?: number;
}

export interface UpdateProjectServiceInput {
  label?: string;
  description?: string | null;
  quantity?: number;
  unit_price?: number;
  adjustment_label?: string | null;
  adjustment_amount?: number;
}

// ─── Picker Types (for catalog integration) ───────────────────────────────────

export interface ServicePickerItem {
  id: string;
  label: string;
  default_unit_price: number;
  description: string | null;
}

export interface PackagePickerItem {
  id: string;
  name: string;
  description: string | null;
  item_count: number;
  catalog_total: number; // sum of package items unit_price * quantity
  package_items: {
    id: string;
    label: string;
    quantity: number;
    unit_price: number;
    service_id: string | null;
  }[];
}
