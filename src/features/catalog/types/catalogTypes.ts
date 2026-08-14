export interface Service {
  id: string;
  workspace_id: string;
  label: string;
  default_unit_price: number; // BIGINT minor units
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceInput {
  workspace_id: string;
  label: string;
  default_unit_price?: number;
  description?: string | null;
  is_active?: boolean;
}

export interface UpdateServiceInput {
  label?: string;
  default_unit_price?: number;
  description?: string | null;
  is_active?: boolean;
}

export interface PackageItem {
  id: string;
  package_id: string;
  service_id: string | null;
  label: string;
  quantity: number;
  unit_price: number; // BIGINT minor units
  description: string | null;
  position: number;
  created_at: string;
  service?: Service | null;
}

export interface PackageItemInput {
  id?: string;
  service_id?: string | null;
  label: string;
  quantity: number;
  unit_price: number;
  description?: string | null;
  position?: number;
}

export interface Package {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  package_items?: PackageItem[];
}

export interface PackageWithItems extends Package {
  package_items: PackageItem[];
  calculated_total: number;
}

export interface CreatePackageInput {
  workspace_id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
  items: PackageItemInput[];
}

export interface UpdatePackageInput {
  name?: string;
  description?: string | null;
  is_active?: boolean;
  items?: PackageItemInput[];
}
