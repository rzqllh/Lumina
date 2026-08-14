import { vi } from 'vitest';
import type { ProjectWithClient } from '@/features/projects';

export const mockProjectList: ProjectWithClient[] = [
  {
    id: 'proj_wedding_123',
    workspace_id: 'ws_test_456',
    client_id: 'cli_couple_123',
    title: 'Sarah & Dave Bali Wedding',
    project_number: 'PRJ-2026-001',
    status: 'active',
    currency: 'IDR',
    client_approved_at: null,
    closed_at: null,
    force_closed_at: null,
    force_close_reason: null,
    reopened_at: null,
    created_at: '2026-08-14T01:00:00Z',
    updated_at: '2026-08-14T01:00:00Z',
    client: {
      id: 'cli_couple_123',
      display_name: 'Sarah & Dave Wedding',
      client_type: 'couple',
      custom_type_label: null,
      email: 'sarah.dave@example.com',
      phone: '+62 812-3456-7890',
    },
  },
  {
    id: 'proj_corp_456',
    workspace_id: 'ws_test_456',
    client_id: 'cli_org_456',
    title: 'Nexus Tech Annual Keynote',
    project_number: 'PRJ-2026-002',
    status: 'draft',
    currency: 'IDR',
    client_approved_at: null,
    closed_at: null,
    force_closed_at: null,
    force_close_reason: null,
    reopened_at: null,
    created_at: '2026-08-14T02:00:00Z',
    updated_at: '2026-08-14T02:00:00Z',
    client: {
      id: 'cli_org_456',
      display_name: 'Nexus Tech Global',
      client_type: 'organization',
      custom_type_label: null,
      email: 'contact@nexustech.io',
      phone: '+62 21-555-0199',
    },
  },
  {
    id: 'proj_archived_789',
    workspace_id: 'ws_test_456',
    client_id: 'cli_archived_789',
    title: 'Archived Studio Session',
    project_number: null,
    status: 'archived',
    currency: 'IDR',
    client_approved_at: null,
    closed_at: null,
    force_closed_at: null,
    force_close_reason: null,
    reopened_at: null,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    client: {
      id: 'cli_archived_789',
      display_name: 'Old Studio Job',
      client_type: 'individual',
      custom_type_label: null,
      email: 'old@example.com',
      phone: null,
    },
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
