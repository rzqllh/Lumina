import React from 'react';
import type { BriefSection, BriefField } from '../types';
import { BriefFieldRenderer } from './BriefFieldRenderer';
import { Plus, MoreVertical, Edit2, Trash2, HelpCircle } from 'lucide-react';

interface BriefSectionCardProps {
  section: BriefSection;
  onAddField: (section: BriefSection) => void;
  onEditSection: (section: BriefSection) => void;
  onDeleteSection: (sectionId: string) => void;
  onEditField: (field: BriefField, section: BriefSection) => void;
  onDeleteField: (fieldId: string) => void;
}

export const BriefSectionCard: React.FC<BriefSectionCardProps> = ({
  section,
  onAddField,
  onEditSection,
  onDeleteSection,
  onEditField,
  onDeleteField,
}) => {
  const [showSectionMenu, setShowSectionMenu] = React.useState(false);
  const [activeFieldMenuId, setActiveFieldMenuId] = React.useState<string | null>(null);

  const fields = section.fields || [];

  return (
    <div
      data-testid={`brief-section-card-${section.id}`}
      className="rounded-xl border border-border bg-surface shadow-2xs transition-all overflow-hidden"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface-muted/30 px-4 py-3 sm:px-5">
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary truncate">{section.label}</h3>
            <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-semibold text-text-secondary border border-border-subtle tabular-nums">
              {fields.length} {fields.length === 1 ? 'question' : 'questions'}
            </span>
          </div>
          {section.instruction_text && (
            <p className="text-xs text-text-secondary flex items-center gap-1">
              <HelpCircle className="h-3 w-3 shrink-0 text-text-muted" strokeWidth={1.75} />
              {section.instruction_text}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-3 shrink-0">
          <button
            type="button"
            data-testid={`add-field-btn-${section.id}`}
            onClick={() => onAddField(section)}
            className="flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1.5 text-xs font-semibold text-text-secondary border border-border hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer shadow-subtle"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Add Question</span>
          </button>

          <div className="relative">
            <button
              type="button"
              data-testid={`section-menu-btn-${section.id}`}
              onClick={() => setShowSectionMenu(!showSectionMenu)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
            </button>

            {showSectionMenu && (
              <div className="absolute right-0 top-8 z-30 w-36 rounded-xl border border-border bg-surface p-1 shadow-sheet animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowSectionMenu(false);
                    onEditSection(section);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Edit Section
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSectionMenu(false);
                    onDeleteSection(section.id);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-status-danger-text hover:bg-status-danger-subtle transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Delete Section
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fields List */}
      <div className="p-4 sm:p-5 space-y-3">
        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-6 text-center">
            <p className="text-xs text-text-muted">No questions added to this section yet.</p>
            <button
              type="button"
              onClick={() => onAddField(section)}
              className="mt-2 text-xs font-semibold text-primary-text hover:underline cursor-pointer"
            >
              + Add First Question
            </button>
          </div>
        ) : (
          fields.map((field) => (
            <div key={field.id} className="group relative">
              <BriefFieldRenderer field={field} showVisibilityBadge={true} />

              <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="relative">
                  <button
                    type="button"
                    data-testid={`field-menu-btn-${field.id}`}
                    onClick={() =>
                      setActiveFieldMenuId(activeFieldMenuId === field.id ? null : field.id)
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-surface border border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <MoreVertical className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>

                  {activeFieldMenuId === field.id && (
                    <div className="absolute right-0 top-7 z-30 w-32 rounded-xl border border-border bg-surface p-1 shadow-sheet animate-in fade-in zoom-in-95 duration-100">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFieldMenuId(null);
                          onEditField(field, section);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-3 w-3" strokeWidth={1.75} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFieldMenuId(null);
                          onDeleteField(field.id);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-status-danger-text hover:bg-status-danger-subtle transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" strokeWidth={1.75} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
