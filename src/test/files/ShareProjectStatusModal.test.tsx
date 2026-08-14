import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShareProjectStatusModal } from '@/features/files/components/ShareProjectStatusModal';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

describe('ShareProjectStatusModal (PORTAL-REQ-002 / INV-004 / INV-010)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it('generates tokenized status link and displays share url', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: {
        link_id: 'link-123',
        raw_token: 'tok_status_abc999',
        is_existing: false,
        expires_at: '2026-09-14T00:00:00Z',
      },
      error: null,
    } as never);

    render(
      <QueryClientProvider client={queryClient}>
        <ShareProjectStatusModal
          isOpen={true}
          onClose={vi.fn()}
          workspaceId="ws-123"
          projectId="proj-123"
        />
      </QueryClientProvider>
    );

    expect(screen.getByText('Live Client Status Portal')).toBeInTheDocument();

    await waitFor(() => {
      const urlInput = screen.getByTestId('status-share-url-input') as HTMLInputElement;
      expect(urlInput.value).toContain('/share/tok_status_abc999');
    });

    expect(screen.getByTestId('copy-status-link-btn')).toBeInTheDocument();
  });

  it('revokes status link when Revoke Link button is clicked', async () => {
    vi.mocked(supabase.rpc).mockImplementation((func: string) => {
      if (func === 'generate_project_status_share_link') {
        return Promise.resolve({
          data: {
            link_id: 'link-123',
            raw_token: 'tok_status_abc999',
            is_existing: false,
            expires_at: '2026-09-14T00:00:00Z',
          },
          error: null,
        }) as never;
      }
      if (func === 'revoke_project_share_link') {
        return Promise.resolve({
          data: { success: true, revoked_at: '2026-08-14T12:00:00Z' },
          error: null,
        }) as never;
      }
      return Promise.resolve({ data: null, error: null }) as never;
    });

    const handleClose = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ShareProjectStatusModal
          isOpen={true}
          onClose={handleClose}
          workspaceId="ws-123"
          projectId="proj-123"
        />
      </QueryClientProvider>
    );

    const revokeBtn = await screen.findByTestId('revoke-status-link-btn');
    fireEvent.click(revokeBtn);

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('revoke_project_share_link', {
        p_link_id: 'link-123',
      });
    });

    expect(handleClose).toHaveBeenCalled();
  });
});
