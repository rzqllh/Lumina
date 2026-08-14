import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectServiceRow } from '@/features/project-pricing';
import { mockProjectServices } from './pricingMocks';

describe('ProjectServiceRow (F-PRICING-001)', () => {
  const ps = mockProjectServices[0]; // unit_price 2500000, adj 0
  const psWithAdjustment = mockProjectServices[1]; // subtotal 3500000, adj -500000

  it('renders label and description', () => {
    render(<ProjectServiceRow projectService={ps} onEdit={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('Wedding Photography (Full Day)')).toBeInTheDocument();
    expect(screen.getByText(/Up to 10 hours/)).toBeInTheDocument();
  });

  it('renders net line total when adjustment is 0', () => {
    render(<ProjectServiceRow projectService={ps} onEdit={vi.fn()} onRemove={vi.fn()} />);
    // net_line_total = 2500000 + 0 = 2500000
    expect(screen.getByTestId(`net-total-${ps.id}`)).toHaveTextContent('Rp 2.500.000');
  });

  it('renders net line total with negative adjustment correctly', () => {
    render(
      <ProjectServiceRow projectService={psWithAdjustment} onEdit={vi.fn()} onRemove={vi.fn()} />
    );
    // net_line_total = 3500000 + (-500000) = 3000000
    expect(screen.getByTestId(`net-total-${psWithAdjustment.id}`)).toHaveTextContent(
      'Rp 3.000.000'
    );
  });

  it('renders adjustment label and amount when adjustment is present', () => {
    render(
      <ProjectServiceRow projectService={psWithAdjustment} onEdit={vi.fn()} onRemove={vi.fn()} />
    );
    expect(screen.getByText('Early bird discount')).toBeInTheDocument();
    expect(screen.getByTestId(`adjustment-amount-${psWithAdjustment.id}`)).toHaveTextContent(
      '−Rp 500.000'
    );
  });

  it('does NOT render adjustment row when adjustment_amount is 0 and no adjustment_label', () => {
    render(<ProjectServiceRow projectService={ps} onEdit={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.queryByTestId(`adjustment-amount-${ps.id}`)).not.toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<ProjectServiceRow projectService={ps} onEdit={onEdit} onRemove={vi.fn()} />);
    fireEvent.click(screen.getByTestId(`edit-project-service-${ps.id}`));
    expect(onEdit).toHaveBeenCalledWith(ps);
  });

  it('calls onRemove when Remove button is clicked', () => {
    const onRemove = vi.fn();
    render(<ProjectServiceRow projectService={ps} onEdit={vi.fn()} onRemove={onRemove} />);
    fireEvent.click(screen.getByTestId(`remove-project-service-${ps.id}`));
    expect(onRemove).toHaveBeenCalledWith(ps);
  });

  it('renders quantity × unit_price breakdown', () => {
    const psMultiQty = { ...mockProjectServices[2] }; // qty=2, unit_price=750000
    render(<ProjectServiceRow projectService={psMultiQty} onEdit={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText(/2 × Rp 750\.000/)).toBeInTheDocument();
  });
});
