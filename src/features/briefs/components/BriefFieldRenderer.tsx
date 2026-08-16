import React from 'react';
import type { BriefField, BriefFieldType } from '../types';
import {
  Type,
  AlignLeft,
  Calendar,
  Clock,
  MapPin,
  Link2,
  Paperclip,
  CheckSquare,
  ListTodo,
  Eye,
  Lock,
  Edit3,
} from 'lucide-react';

interface BriefFieldRendererProps {
  field: BriefField;
  isReadOnly?: boolean;
  value?: unknown;
  onChange?: (val: unknown) => void;
  showVisibilityBadge?: boolean;
}

export const BriefFieldRenderer: React.FC<BriefFieldRendererProps> = ({
  field,
  isReadOnly = false,
  value,
  onChange,
  showVisibilityBadge = false,
}) => {
  const currentValue = value !== undefined ? value : field.value;

  function getFieldIcon(type: BriefFieldType) {
    switch (type) {
      case 'short_text':
        return <Type className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />;
      case 'long_text':
      case 'rich_text':
        return <AlignLeft className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />;
      case 'date':
      case 'datetime':
        return <Calendar className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />;
      case 'time':
        return <Clock className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />;
      case 'location':
        return <MapPin className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />;
      case 'url':
        return <Link2 className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />;
      case 'file_reference':
        return <Paperclip className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />;
      case 'checkbox':
        return <CheckSquare className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />;
      default:
        return <ListTodo className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />;
    }
  }

  function renderVisibilityBadge() {
    if (!showVisibilityBadge) return null;

    switch (field.visibility) {
      case 'internal_only':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-status-warning-subtle px-1.5 py-0.5 text-[10px] font-semibold text-status-warning-text border border-status-warning-border">
            <Lock className="h-2.5 w-2.5" strokeWidth={1.75} />
            Internal Only
          </span>
        );
      case 'client_can_view':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-status-info-subtle px-1.5 py-0.5 text-[10px] font-semibold text-status-info-text border border-status-info-border">
            <Eye className="h-2.5 w-2.5" strokeWidth={1.75} />
            Client View
          </span>
        );
      case 'client_can_fill':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-status-success-subtle px-1.5 py-0.5 text-[10px] font-semibold text-status-success-text border border-status-success-border">
            <Edit3 className="h-2.5 w-2.5" strokeWidth={1.75} />
            Client Fill
          </span>
        );
      case 'client_must_fill':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-primary-subtle px-1.5 py-0.5 text-[10px] font-semibold text-primary-text border border-primary-border">
            <Edit3 className="h-2.5 w-2.5" strokeWidth={1.75} />
            Client Must Fill *
          </span>
        );
    }
  }

  // ── Editable Input Mode ───────────────────────────────────────────────────
  if (!isReadOnly && onChange) {
    switch (field.field_type) {
      case 'checkbox':
        return (
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
              <input
                type="checkbox"
                data-testid={`brief-input-${field.id}`}
                checked={Boolean(currentValue)}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
              />
              <span>{field.label}</span>
              {field.is_required && <span className="text-status-danger-text">*</span>}
            </label>
            {field.helper_text && (
              <p className="text-xs text-text-muted pl-6">{field.helper_text}</p>
            )}
          </div>
        );

      case 'long_text':
      case 'rich_text':
        return (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                {getFieldIcon(field.field_type)}
                <span>{field.label}</span>
                {field.is_required && <span className="text-status-danger-text">*</span>}
              </label>
              {renderVisibilityBadge()}
            </div>
            {field.helper_text && <p className="text-xs text-text-muted">{field.helper_text}</p>}
            <textarea
              rows={3}
              data-testid={`brief-input-${field.id}`}
              value={typeof currentValue === 'string' ? currentValue : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            />
          </div>
        );

      default:
        return (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                {getFieldIcon(field.field_type)}
                <span>{field.label}</span>
                {field.is_required && <span className="text-status-danger-text">*</span>}
              </label>
              {renderVisibilityBadge()}
            </div>
            {field.helper_text && <p className="text-xs text-text-muted">{field.helper_text}</p>}
            <input
              type={
                field.field_type === 'number'
                  ? 'number'
                  : field.field_type === 'date'
                    ? 'date'
                    : field.field_type === 'time'
                      ? 'time'
                      : field.field_type === 'url'
                        ? 'url'
                        : 'text'
              }
              data-testid={`brief-input-${field.id}`}
              value={
                currentValue !== null && currentValue !== undefined ? String(currentValue) : ''
              }
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        );
    }
  }

  // ── Read Only / Canonical Display Mode ────────────────────────────────────
  return (
    <div
      data-testid={`brief-field-item-${field.id}`}
      className="space-y-1 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-border-subtle"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {getFieldIcon(field.field_type)}
          <span className="text-xs font-semibold text-text-primary">{field.label}</span>
          {field.is_required && (
            <span className="text-xs text-status-danger-text font-bold">*</span>
          )}
        </div>
        {renderVisibilityBadge()}
      </div>

      {field.helper_text && <p className="text-xs text-text-muted">{field.helper_text}</p>}

      <div className="pt-0.5">
        {currentValue !== null &&
        currentValue !== undefined &&
        String(currentValue).trim() !== '' ? (
          field.field_type === 'url' ? (
            <a
              href={String(currentValue)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-primary-text hover:underline flex items-center gap-1 truncate"
            >
              <Link2 className="h-3 w-3 shrink-0" strokeWidth={1.75} />
              {String(currentValue)}
            </a>
          ) : field.field_type === 'checkbox' ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary">
              <CheckSquare className="h-3.5 w-3.5 text-primary-text" strokeWidth={1.75} />
              {currentValue ? 'Yes' : 'No'}
            </span>
          ) : (
            <p className="text-xs font-medium text-text-secondary whitespace-pre-wrap leading-relaxed">
              {String(currentValue)}
            </p>
          )
        ) : (
          <p className="text-xs italic text-text-muted">Not specified</p>
        )}
      </div>
    </div>
  );
};
