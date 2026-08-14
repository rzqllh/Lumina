import { vi } from 'vitest';
import type { Service, PackageWithItems } from '@/features/catalog';

export const mockServicesList: Service[] = [
  {
    id: 'srv_photo_123',
    workspace_id: 'ws_test_456',
    label: 'Lead Photography (Full Day)',
    default_unit_price: 2500000,
    description: 'Up to 8 hours shooting coverage with 1 lead photographer.',
    is_active: true,
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
  },
  {
    id: 'srv_video_456',
    workspace_id: 'ws_test_456',
    label: 'Cinematic Videography',
    default_unit_price: 3500000,
    description: '4K highlight teaser (3-5 min) + full documentary edit.',
    is_active: true,
    created_at: '2026-08-14T01:00:00Z',
    updated_at: '2026-08-14T01:00:00Z',
  },
  {
    id: 'srv_drone_789',
    workspace_id: 'ws_test_456',
    label: 'Aerial Drone Pilot',
    default_unit_price: 1000000,
    description: 'Licensed drone operator for landscape & venue footage.',
    is_active: true,
    created_at: '2026-08-14T02:00:00Z',
    updated_at: '2026-08-14T02:00:00Z',
  },
  {
    id: 'srv_archived_999',
    workspace_id: 'ws_test_456',
    label: 'Legacy Print Album',
    default_unit_price: 750000,
    description: 'Old physical album format.',
    is_active: false,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
  },
];

export const mockPackagesList: PackageWithItems[] = [
  {
    id: 'pkg_wedding_123',
    workspace_id: 'ws_test_456',
    name: 'Wedding Full Day Deluxe',
    description: 'Complete photo + video + drone coverage for luxury weddings.',
    is_active: true,
    created_at: '2026-08-14T03:00:00Z',
    updated_at: '2026-08-14T03:00:00Z',
    calculated_total: 7000000,
    package_items: [
      {
        id: 'item_1',
        package_id: 'pkg_wedding_123',
        service_id: 'srv_photo_123',
        label: 'Lead Photography (Full Day)',
        quantity: 1,
        unit_price: 2500000,
        description: null,
        position: 0,
        created_at: '2026-08-14T03:00:00Z',
      },
      {
        id: 'item_2',
        package_id: 'pkg_wedding_123',
        service_id: 'srv_video_456',
        label: 'Cinematic Videography',
        quantity: 1,
        unit_price: 3500000,
        description: null,
        position: 1,
        created_at: '2026-08-14T03:00:00Z',
      },
      {
        id: 'item_3',
        package_id: 'pkg_wedding_123',
        service_id: 'srv_drone_789',
        label: 'Aerial Drone Pilot',
        quantity: 1,
        unit_price: 1000000,
        description: null,
        position: 2,
        created_at: '2026-08-14T03:00:00Z',
      },
    ],
  },
  {
    id: 'pkg_grad_456',
    workspace_id: 'ws_test_456',
    name: 'Graduation Solo Portrait',
    description: '1 hour studio/campus portrait session with 10 edited high-res photos.',
    is_active: true,
    created_at: '2026-08-14T04:00:00Z',
    updated_at: '2026-08-14T04:00:00Z',
    calculated_total: 1500000,
    package_items: [
      {
        id: 'item_4',
        package_id: 'pkg_grad_456',
        service_id: null,
        label: 'Portrait Photography (1 Hour)',
        quantity: 1,
        unit_price: 1500000,
        description: 'Includes 10 edited color graded photos',
        position: 0,
        created_at: '2026-08-14T04:00:00Z',
      },
    ],
  },
];

export function createMockQueryBuilder(data: unknown = null, error: unknown = null) {
  const builder: {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    neq: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    then: (resolve: (val: { data: unknown; error: unknown }) => unknown) => Promise<unknown>;
  } = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    order: vi.fn(),
    single: vi.fn().mockImplementation(() => Promise.resolve({ data, error })),
    then: (resolve) => Promise.resolve({ data, error }).then(resolve),
  };

  builder.select.mockImplementation(() => builder);
  builder.insert.mockImplementation(() => builder);
  builder.update.mockImplementation(() => builder);
  builder.delete.mockImplementation(() => builder);
  builder.eq.mockImplementation(() => builder);
  builder.neq.mockImplementation(() => builder);
  builder.order.mockImplementation(() => builder);

  return builder;
}
