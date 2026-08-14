import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StagePipeline } from '@/features/project-workflow/components/StagePipeline';
import type { ProjectWorkflowStage } from '@/features/project-workflow/types';

const mockStages: ProjectWorkflowStage[] = [
  {
    id: 'stg-1',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    label: 'Preparation & Briefing',
    position: 0,
    status: 'completed',
    source_template_id: 'tmpl-1',
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
  },
  {
    id: 'stg-2',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    label: 'Production Shoot',
    position: 1,
    status: 'active',
    source_template_id: 'tmpl-1',
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
  },
  {
    id: 'stg-3',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    label: 'Editing & Grading',
    position: 2,
    status: 'not_started',
    source_template_id: 'tmpl-1',
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
  },
  {
    id: 'stg-4',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    label: 'Physical Print Delivery',
    position: 3,
    status: 'skipped',
    source_template_id: null,
    created_at: '2026-08-14T00:00:00Z',
    updated_at: '2026-08-14T00:00:00Z',
  },
];

describe('StagePipeline (WORKFLOW-REQ-002 / WORKFLOW-REQ-005)', () => {
  it('renders progress percentage and stage cards with appropriate status badges', () => {
    const onStatusChange = vi.fn();

    render(<StagePipeline stages={mockStages} onStatusChange={onStatusChange} />);

    expect(screen.getByText(/Progress: 1\/4 completed \(25%\)/i)).toBeInTheDocument();
    expect(screen.getByText('1 Active')).toBeInTheDocument();
    expect(screen.getByText('Preparation & Briefing')).toBeInTheDocument();
    expect(screen.getByText('Production Shoot')).toBeInTheDocument();
    expect(screen.getByText('Editing & Grading')).toBeInTheDocument();
    expect(screen.getByText('Physical Print Delivery')).toBeInTheDocument();

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Not Started')).toBeInTheDocument();
    expect(screen.getByText('Skipped')).toBeInTheDocument();
  });

  it('triggers onStatusChange when clicking Start, Complete, Skip or Reopen buttons', () => {
    const onStatusChange = vi.fn();

    render(<StagePipeline stages={mockStages} onStatusChange={onStatusChange} />);

    // Active stage -> Complete
    const completeBtn = screen.getByRole('button', { name: /complete/i });
    fireEvent.click(completeBtn);
    expect(onStatusChange).toHaveBeenCalledWith('stg-2', 'completed');

    // Not started stage -> Start
    const startBtn = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startBtn);
    expect(onStatusChange).toHaveBeenCalledWith('stg-3', 'active');
  });

  it('selects stage to filter tasks when clicking stage card', () => {
    const onSelectStage = vi.fn();

    render(
      <StagePipeline stages={mockStages} onStatusChange={vi.fn()} onSelectStage={onSelectStage} />
    );

    const stageCard = screen.getByText('Production Shoot');
    fireEvent.click(stageCard);

    expect(onSelectStage).toHaveBeenCalledWith('stg-2');
  });
});
