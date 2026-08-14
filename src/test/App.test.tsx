import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App';

describe('Lumina Foundation & Shell', () => {
  it('renders application shell and navigation header', () => {
    render(<App />);

    // Brand and version tag
    expect(screen.getByText('Lumina')).toBeInTheDocument();
    expect(screen.getByText('v0.1.0')).toBeInTheDocument();

    // Default route placeholder
    expect(screen.getByText('Overview & Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText(
        'High-level workspace operational summary, urgent tasks, and upcoming shoots.'
      )
    ).toBeInTheDocument();
  });
});
