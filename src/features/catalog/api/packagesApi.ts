import { supabase } from '@/lib/supabase';
import type {
  Package,
  PackageWithItems,
  PackageItem,
  CreatePackageInput,
  UpdatePackageInput,
} from '../types/catalogTypes';

export async function fetchPackages(
  workspaceId: string,
  activeOnly: boolean = false
): Promise<PackageWithItems[]> {
  let query = supabase
    .from('packages')
    .select('*, package_items(*, service:services(id, label, default_unit_price, is_active))')
    .eq('workspace_id', workspaceId);

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  query = query.order('name', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((pkg) => {
    const items = (pkg.package_items || []) as PackageItem[];
    // Sort items by position
    items.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const calculated_total = items.reduce(
      (sum, item) => sum + (item.quantity ?? 1) * (item.unit_price ?? 0),
      0
    );
    return {
      ...pkg,
      package_items: items,
      calculated_total,
    } as PackageWithItems;
  });
}

export async function fetchPackageById(
  workspaceId: string,
  packageId: string
): Promise<PackageWithItems> {
  const { data, error } = await supabase
    .from('packages')
    .select('*, package_items(*, service:services(id, label, default_unit_price, is_active))')
    .eq('workspace_id', workspaceId)
    .eq('id', packageId)
    .single();

  if (error) throw error;

  const items = (data.package_items || []) as PackageItem[];
  items.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const calculated_total = items.reduce(
    (sum, item) => sum + (item.quantity ?? 1) * (item.unit_price ?? 0),
    0
  );

  return {
    ...data,
    package_items: items,
    calculated_total,
  } as PackageWithItems;
}

export async function createPackage(input: CreatePackageInput): Promise<Package> {
  // 1. Insert package header
  const { data: newPkg, error: pkgError } = await supabase
    .from('packages')
    .insert({
      workspace_id: input.workspace_id,
      name: input.name,
      description: input.description || null,
      is_active: input.is_active ?? true,
    })
    .select()
    .single();

  if (pkgError) throw pkgError;

  // 2. Insert package items
  if (input.items && input.items.length > 0) {
    const itemsToInsert = input.items.map((item, idx) => ({
      package_id: newPkg.id,
      service_id: item.service_id || null,
      label: item.label,
      quantity: item.quantity,
      unit_price: item.unit_price,
      description: item.description || null,
      position: item.position ?? idx,
    }));

    const { error: itemsError } = await supabase.from('package_items').insert(itemsToInsert);

    if (itemsError) throw itemsError;
  }

  return newPkg as Package;
}

export async function updatePackage(
  workspaceId: string,
  packageId: string,
  input: UpdatePackageInput
): Promise<Package> {
  // 1. Update package header
  const { data: updatedPkg, error: pkgError } = await supabase
    .from('packages')
    .update({
      name: input.name,
      description: input.description,
      is_active: input.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('workspace_id', workspaceId)
    .eq('id', packageId)
    .select()
    .single();

  if (pkgError) throw pkgError;

  // 2. Update package items (delete existing and re-insert)
  if (input.items) {
    const { error: deleteError } = await supabase
      .from('package_items')
      .delete()
      .eq('package_id', packageId);

    if (deleteError) throw deleteError;

    if (input.items.length > 0) {
      const itemsToInsert = input.items.map((item, idx) => ({
        package_id: packageId,
        service_id: item.service_id || null,
        label: item.label,
        quantity: item.quantity,
        unit_price: item.unit_price,
        description: item.description || null,
        position: item.position ?? idx,
      }));

      const { error: itemsError } = await supabase.from('package_items').insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }
  }

  return updatedPkg as Package;
}

export async function duplicatePackage(
  workspaceId: string,
  packageId: string,
  newName?: string
): Promise<string> {
  // Try atomic RPC first
  const { data, error } = await supabase.rpc('duplicate_package', {
    p_workspace_id: workspaceId,
    p_package_id: packageId,
    p_new_name: newName || null,
  });

  if (!error && data) {
    return data as string;
  }

  // Fallback to client-side duplication if RPC not available
  const src = await fetchPackageById(workspaceId, packageId);
  const cloned = await createPackage({
    workspace_id: workspaceId,
    name: newName || `${src.name} (Copy)`,
    description: src.description,
    is_active: true,
    items: src.package_items.map((item) => ({
      service_id: item.service_id,
      label: item.label,
      quantity: item.quantity,
      unit_price: item.unit_price,
      description: item.description,
      position: item.position,
    })),
  });

  return cloned.id;
}

export async function deletePackage(workspaceId: string, packageId: string): Promise<void> {
  const { error } = await supabase
    .from('packages')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('id', packageId);

  if (error) throw error;
}
