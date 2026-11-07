import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BriefFieldRenderer } from '@/features/briefs/components/BriefFieldRenderer';
import type { BriefField } from '@/features/briefs/types';

const field: BriefField = {
  id: 'safe-link-test',
  section_id: 'section',
  field_type: 'url',
  label: 'Link',
  helper_text: null,
  is_required: false,
  visibility: 'client_can_view',
  value: null,
  position: 0,
  created_at: '',
  updated_at: '',
};

describe('BriefFieldRenderer — external URL safety', () => {
  it('renders a valid HTTPS URL as a guarded link', () => {
    render(<BriefFieldRenderer field={{ ...field, value: 'https://example.com/reference' }} />);
    const link = screen.getByRole('link', { name: /example.com\/reference/ });
    expect(link).toHaveAttribute('href', 'https://example.com/reference');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders dangerous URI schemes as inert text', () => {
    render(<BriefFieldRenderer field={{ ...field, value: 'javascript:alert(1)' }} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('javascript:alert(1)')).toBeInTheDocument();
  });

  it('does not expose credential-bearing URLs as clickable links', () => {
    render(<BriefFieldRenderer field={{ ...field, value: 'https://user:secret@example.com/' }} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
