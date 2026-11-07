import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShareBriefLinkModal } from '@/features/briefs/components/ShareBriefLinkModal';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: { rpc: vi.fn() },
}));

function renderModal() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <ShareBriefLinkModal isOpen={true} onClose={vi.fn()} projectId="project-1" />
    </QueryClientProvider>
  );
}

describe('ShareBriefLinkModal — unrecoverable tokens', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('never fabricates an active client URL or silently revokes a link', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: { link_id: 'old-link', is_existing: true, expires_at: null },
      error: null,
    } as never);

    renderModal();

    expect(await screen.findByTestId('rotate-brief-link-btn')).toBeInTheDocument();
    expect(screen.getByText(/original token cannot be recovered/i)).toBeInTheDocument();
    expect(screen.queryByTestId('share-url-input')).not.toBeInTheDocument();
    expect(supabase.rpc).not.toHaveBeenCalledWith('revoke_project_share_link', expect.anything());
  });

  it('rotates only after user confirmation and creates a real token URL', async () => {
    let generated = 0;
    vi.mocked(supabase.rpc).mockImplementation((fn: string) => {
      if (fn === 'generate_brief_share_link') {
        generated++;
        return Promise.resolve({
          data: generated === 1
            ? { link_id: 'old-link', is_existing: true, expires_at: null }
            : { link_id: 'new-link', raw_token: 'fresh-secret-token', is_existing: false, expires_at: null },
          error: null,
        }) as never;
      }
      if (fn === 'revoke_project_share_link') {
        return Promise.resolve({ data: { success: true }, error: null }) as never;
      }
      return Promise.resolve({ data: null, error: null }) as never;
    });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderModal();
    const rotate = await screen.findByTestId('rotate-brief-link-btn');
    fireEvent.click(rotate);

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('revoke_project_share_link', { p_link_id: 'old-link' });
      const input = screen.getByTestId('share-url-input') as HTMLInputElement;
      expect(input.value).toContain('/brief/fresh-secret-token');
    });
    expect(confirmSpy).toHaveBeenCalledOnce();
  });
});
