import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectFilesSection } from '@/features/files/components/ProjectFilesSection';
import { supabase } from '@/lib/supabase';
import type { FileReference } from '@/features/files/types';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

const mockFiles: FileReference[] = [
  {
    id: 'file-1',
    workspace_id: 'ws-123',
    project_id: 'proj-123',
    deliverable_id: null,
    revision_id: null,
    provider: 'google_drive',
    display_name: 'High-Res Photo Gallery (Google Drive)',
    url_or_path: 'https://drive.google.com/drive/folders/abc123xyz',
    mime_type: null,
    size_bytes: null,
    is_client_visible: true,
    notes: 'Full resolution RAW and JPEG export folder',
    created_at: '2026-08-14T10:00:00Z',
    updated_at: '2026-08-14T10:00:00Z',
  },
];

function createMockQueryBuilder(data: unknown = null, error: unknown = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnValue(Promise.resolve({ data, error })),
    maybeSingle: vi.fn().mockReturnValue(Promise.resolve({ data, error })),
    then: (resolve: (val: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve({ data, error }).then(resolve),
  };
  return builder;
}

describe('ProjectFilesSection (PORTAL-REQ-001 / INV-009)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  function renderFilesSection() {
    return render(
      <QueryClientProvider client={queryClient}>
        <ProjectFilesSection workspaceId="ws-123" projectId="proj-123" />
      </QueryClientProvider>
    );
  }

  it('renders attached external file links with Google Drive provider badge and client visibility tag', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'file_references') {
        return createMockQueryBuilder(mockFiles) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderFilesSection();

    expect(
      await screen.findByText('External Files, Google Drive & Client Portal')
    ).toBeInTheDocument();
    expect(screen.getByText('High-Res Photo Gallery (Google Drive)')).toBeInTheDocument();
    expect(screen.getByText('Google Drive')).toBeInTheDocument();
    expect(screen.getByText('Client Visible')).toBeInTheDocument();
    expect(screen.getByText('Open Link')).toBeInTheDocument();
  });

  it('opens file attachment modal and attaches a new external media link', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'file_references') {
        return createMockQueryBuilder(mockFiles) as never;
      }
      return createMockQueryBuilder([]) as never;
    });

    renderFilesSection();

    const attachBtn = await screen.findByTestId('attach-file-link-btn');
    fireEvent.click(attachBtn);

    expect(screen.getByTestId('file-reference-form-modal')).toBeInTheDocument();

    const nameInput = screen.getByTestId('file-name-input');
    fireEvent.change(nameInput, { target: { value: '4K Highlight Reel' } });

    const urlInput = screen.getByTestId('file-url-input');
    fireEvent.change(urlInput, {
      target: { value: 'https://drive.google.com/file/d/highlight-reel' },
    });

    const submitBtn = screen.getByTestId('submit-file-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('file_references');
    });
  });
});
