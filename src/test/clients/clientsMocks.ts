import { vi } from 'vitest';
import type { ClientContact, ClientListItem, ClientWithContacts } from '@/features/clients';

export const mockClientList: ClientListItem[] = [
  {
    id: 'cli_couple_123',
    workspace_id: 'ws_test_456',
    display_name: 'Sarah & Dave Wedding',
    client_type: 'couple',
    custom_type_label: null,
    email: 'sarah.dave@example.com',
    phone: '+62 812-3456-7890',
    notes: 'Referred by Bali Villa Coordinator.',
    is_archived: false,
    created_at: '2026-08-14T01:00:00Z',
    updated_at: '2026-08-14T01:00:00Z',
    contacts: [
      { id: 'con_bride_1', is_primary: true },
      { id: 'con_groom_2', is_primary: false },
    ],
  },
  {
    id: 'cli_org_456',
    workspace_id: 'ws_test_456',
    display_name: 'Nexus Tech Global',
    client_type: 'organization',
    custom_type_label: null,
    email: 'contact@nexustech.io',
    phone: '+62 21-555-0199',
    notes: 'Annual corporate gathering video coverage.',
    is_archived: false,
    created_at: '2026-08-14T02:00:00Z',
    updated_at: '2026-08-14T02:00:00Z',
    contacts: [{ id: 'con_pic_3', is_primary: true }],
  },
  {
    id: 'cli_archived_789',
    workspace_id: 'ws_test_456',
    display_name: 'Old Archived Studio Job',
    client_type: 'individual',
    custom_type_label: null,
    email: 'old@example.com',
    phone: null,
    notes: null,
    is_archived: true,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    contacts: [],
  },
];

export const mockClientContacts: ClientContact[] = [
  {
    id: 'con_bride_1',
    workspace_id: 'ws_test_456',
    client_id: 'cli_couple_123',
    name: 'Sarah Jenkins',
    role_label: 'Bride',
    email: 'sarah@example.com',
    phone: '+62 811-111-222',
    notes: 'Prefers WhatsApp communications',
    is_primary: true,
    created_at: '2026-08-14T01:05:00Z',
    updated_at: '2026-08-14T01:05:00Z',
  },
  {
    id: 'con_groom_2',
    workspace_id: 'ws_test_456',
    client_id: 'cli_couple_123',
    name: 'Dave Miller',
    role_label: 'Groom',
    email: 'dave@example.com',
    phone: '+62 811-333-444',
    notes: null,
    is_primary: false,
    created_at: '2026-08-14T01:06:00Z',
    updated_at: '2026-08-14T01:06:00Z',
  },
];

export const mockSingleClientWithContacts: ClientWithContacts = {
  ...mockClientList[0],
  contacts: mockClientContacts,
};

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
