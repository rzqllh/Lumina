import type { ProjectService } from '@/features/project-pricing';

export const mockProjectId = 'proj_test_001';
export const mockWorkspaceId = 'ws_test_456';

export const mockProjectServices: ProjectService[] = [
  {
    id: 'ps_photo_001',
    workspace_id: mockWorkspaceId,
    project_id: mockProjectId,
    label: 'Wedding Photography (Full Day)',
    description: 'Up to 10 hours coverage with 1 lead photographer.',
    quantity: 1,
    unit_price: 2500000,
    subtotal: 2500000,
    adjustment_label: null,
    adjustment_amount: 0,
    source_service_id: 'srv_photo_123',
    source_package_id: null,
    position: 0,
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
  },
  {
    id: 'ps_video_002',
    workspace_id: mockWorkspaceId,
    project_id: mockProjectId,
    label: 'Cinematic Videography',
    description: '4K highlight + full documentary.',
    quantity: 1,
    unit_price: 3500000,
    subtotal: 3500000,
    adjustment_label: 'Early bird discount',
    adjustment_amount: -500000,
    source_service_id: 'srv_video_456',
    source_package_id: null,
    position: 1,
    created_at: '2026-08-14T01:00:00Z',
    updated_at: '2026-08-14T01:00:00Z',
  },
  {
    id: 'ps_custom_003',
    workspace_id: mockWorkspaceId,
    project_id: mockProjectId,
    label: 'Custom Drone Coverage',
    description: null,
    quantity: 2,
    unit_price: 750000,
    subtotal: 1500000,
    adjustment_label: null,
    adjustment_amount: 0,
    source_service_id: null,
    source_package_id: null,
    position: 2,
    created_at: '2026-08-14T02:00:00Z',
    updated_at: '2026-08-14T02:00:00Z',
  },
];

// Expected net line totals:
// ps_photo_001: 2500000 + 0 = 2500000
// ps_video_002: 3500000 + (-500000) = 3000000
// ps_custom_003: 1500000 + 0 = 1500000
// Project Value: 7000000

export const mockProjectValue = 7000000;
