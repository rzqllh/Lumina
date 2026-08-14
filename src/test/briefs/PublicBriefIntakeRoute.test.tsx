import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router';
import { PublicBriefIntakeRoute } from '@/routes/briefs/PublicBriefIntakeRoute';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const mockIntakeData = {
  project_title: 'Bali Destination Wedding',
  client_name: 'Sophia & Alexander',
  brief_title: 'Wedding Production Questionnaire',
  sections: [
    {
      id: 'sec-1',
      label: 'Creative Preferences',
      instruction_text: 'Please share your vision and shot preferences',
      position: 0,
      fields: [
        {
          id: 'f-1',
          field_type: 'short_text',
          label: 'Primary Color Palette',
          helper_text: 'e.g., Terracotta & Sage',
          is_required: true,
          visibility: 'client_must_fill',
          value: null,
          position: 0,
        },
        {
          id: 'f-2',
          field_type: 'checkbox',
          label: 'Drone coverage requested',
          helper_text: null,
          is_required: false,
          visibility: 'client_can_fill',
          value: false,
          position: 1,
        },
      ],
    },
  ],
};

describe('PublicBriefIntakeRoute (BRIEF-REQ-004 / INV-003 / INV-004)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  function renderPublicIntake() {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/brief/valid-token-123']}>
          <Routes>
            <Route path="/brief/:token" element={<PublicBriefIntakeRoute />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  it('renders projected client questionnaire fields and validates required input', async () => {
    vi.mocked(supabase.rpc).mockImplementation((func: string) => {
      if (func === 'get_public_brief_intake') {
        return Promise.resolve({ data: mockIntakeData, error: null }) as never;
      }
      return Promise.resolve({ data: null, error: null }) as never;
    });

    renderPublicIntake();

    expect(await screen.findByText('Bali Destination Wedding')).toBeInTheDocument();
    expect(screen.getByText('Creative Preferences')).toBeInTheDocument();
    expect(screen.getByText('Primary Color Palette')).toBeInTheDocument();

    // Attempt submit with required question empty
    const submitBtn = screen.getByTestId('submit-public-intake-btn');
    fireEvent.click(submitBtn);

    expect(await screen.findByTestId('intake-validation-error')).toHaveTextContent(
      'Please answer required question: "Primary Color Palette"'
    );
  });

  it('submits valid questionnaire responses and shows confirmation screen', async () => {
    vi.mocked(supabase.rpc).mockImplementation((func: string) => {
      if (func === 'get_public_brief_intake') {
        return Promise.resolve({ data: mockIntakeData, error: null }) as never;
      }
      if (func === 'submit_public_brief') {
        return Promise.resolve({
          data: { success: true, submission_id: 'sub-1', submitted_at: '2026-08-14T12:00:00Z' },
          error: null,
        }) as never;
      }
      return Promise.resolve({ data: null, error: null }) as never;
    });

    renderPublicIntake();

    expect(await screen.findByText('Bali Destination Wedding')).toBeInTheDocument();

    const textInput = screen.getByTestId('brief-input-f-1');
    fireEvent.change(textInput, { target: { value: 'Champagne & Olive Green' } });

    const submitBtn = screen.getByTestId('submit-public-intake-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('submit_public_brief', {
        p_token: 'valid-token-123',
        p_answers: {
          'f-1': 'Champagne & Olive Green',
          'f-2': false,
        },
      });
    });

    expect(await screen.findByTestId('brief-submission-success')).toBeInTheDocument();
    expect(screen.getByText(/Thank You, Sophia & Alexander!/i)).toBeInTheDocument();
  });
});
