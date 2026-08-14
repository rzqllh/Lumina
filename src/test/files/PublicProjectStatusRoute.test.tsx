import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router';
import { PublicProjectStatusRoute } from '@/routes/portal/PublicProjectStatusRoute';
import { supabase } from '@/lib/supabase';
import type { PublicStatusPortalData } from '@/features/files/types';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const mockPortalData: PublicStatusPortalData = {
  project: {
    id: 'proj-123',
    title: 'Vogue Editorial Lookbook',
    project_number: 'PRJ-2026-088',
    status: 'in_progress',
    currency: 'IDR',
  },
  client: {
    display_name: 'Haute Couture Studio',
  },
  stages: [
    {
      id: 'stg-1',
      label: 'Pre-Production & Moodboard',
      position: 0,
      status: 'completed',
    },
    {
      id: 'stg-2',
      label: 'Main Studio Shoot',
      position: 1,
      status: 'active',
    },
    {
      id: 'stg-3',
      label: 'Editorial Retouching',
      position: 2,
      status: 'not_started',
    },
  ],
  sessions: [
    {
      id: 'ses-1',
      type: 'shoot',
      custom_type_label: null,
      title: 'Studio Lighting & Stills Shoot',
      date: '2026-08-20',
      start_time: '09:00:00',
      end_time: '17:00:00',
      location: 'Studio 4, Jakarta Selatan',
      status: 'scheduled',
    },
  ],
  deliverables: [
    {
      id: 'del-1',
      label: '25 Master Retouched Lookbook Images',
      quantity: 25,
      type_label: 'Photos',
      status: 'approved',
      deadline: '2026-08-28',
      files: [
        {
          id: 'file-1',
          provider: 'google_drive',
          display_name: 'Download Lookbook RAW/JPEG Gallery',
          url_or_path: 'https://drive.google.com/drive/folders/editorial-master',
        },
      ],
    },
  ],
  general_files: [],
};

describe('PublicProjectStatusRoute (PORTAL-REQ-003 / INV-004)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  function renderStatusPortal() {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/share/tok-valid-status-123']}>
          <Routes>
            <Route path="/share/:token" element={<PublicProjectStatusRoute />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  it('renders projected client portal with live timeline, sessions, media download links (and NO financial data)', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: mockPortalData,
      error: null,
    } as never);

    renderStatusPortal();

    expect(await screen.findByText('Vogue Editorial Lookbook')).toBeInTheDocument();
    expect(screen.getByText(/Haute Couture Studio/i)).toBeInTheDocument();

    // Workflow Pipeline
    expect(screen.getByTestId('status-portal-timeline')).toBeInTheDocument();
    expect(screen.getByText('Pre-Production & Moodboard')).toBeInTheDocument();
    expect(screen.getByText('Main Studio Shoot')).toBeInTheDocument();

    // Production Sessions
    expect(screen.getByTestId('public-portal-sessions')).toBeInTheDocument();
    expect(screen.getByText('Studio Lighting & Stills Shoot')).toBeInTheDocument();
    expect(screen.getByText('Studio 4, Jakarta Selatan')).toBeInTheDocument();

    // Deliverables & Google Drive Media Downloads
    expect(screen.getByTestId('public-portal-deliverables')).toBeInTheDocument();
    expect(screen.getByText('25 Master Retouched Lookbook Images')).toBeInTheDocument();
    expect(screen.getByText('Download Lookbook RAW/JPEG Gallery')).toBeInTheDocument();
    expect(screen.getByTestId('public-file-download-file-1')).toHaveAttribute(
      'href',
      'https://drive.google.com/drive/folders/editorial-master'
    );

    // Strict Security & Privacy Invariant (INV-004): No financial schedules or amounts in public portal
    expect(screen.queryByTestId('public-portal-payments')).not.toBeInTheDocument();
    expect(screen.queryByText(/Payment Milestone Invoices/i)).not.toBeInTheDocument();
  });

  it('displays revoked/expired error screen when token is invalid or revoked', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: { message: 'Invalid, expired, or revoked project status link' },
    } as never);

    renderStatusPortal();

    expect(await screen.findByText('Status Link Expired or Revoked')).toBeInTheDocument();
  });
});
