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
        return <Type className="h-3.5 w-3.5 text-text-muted" />;
      case 'long_text':
      case 'rich_text':
        return <AlignLeft className="h-3.5 w-3.5 text-text-muted" />;
      case 'date':
      case 'datetime':
        return <Calendar className="h-3.5 w-3.5 text-text-muted" />;
      case 'time':
        return <Clock className="h-3.5 w-3.5 text-text-muted" />;
      case 'location':
        return <MapPin className="h-3.5 w-3.5 text-text-muted" />;
      case 'url':
        return <Link2 className="h-3.5 w-3.5 text-text-muted" />;
      case 'file_reference':
        return <Paperclip className="h-3.5 w-3.5 text-text-muted" />;
      case 'checkbox':
        return <CheckSquare className="h-3.5 w-3.5 text-text-muted" />;
      default:
        return <ListTodo className="h-3.5 w-3.5 text-text-muted" />;
    }
  }

  function renderVisibilityBadge() {
    if (!showVisibilityBadge) return null;

    switch (field.visibility) {
      case 'internal_only':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
            <Lock className="h-2.5 w-2.5" />
            Internal Only
          </span>
        );
      case 'client_can_view':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
            <Eye className="h-2.5 w-2.5" />
            Client View
          </span>
        );
      case 'client_can_fill':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            <Edit3 className="h-2.5 w-2.5" />
            Client Fill
          </span>
        );
      case 'client_must_fill':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
            <Edit3 className="h-2.5 w-2.5" />
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
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span>{field.label}</span>
              {field.is_required && <span className="text-destructive">*</span>}
            </label>
            {field.helper_text && (
              <p className="text-[11px] text-text-muted pl-6">{field.helper_text}</p>
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
                {field.is_required && <span className="text-destructive">*</span>}
              </label>
              {renderVisibilityBadge()}
            </div>
            {field.helper_text && (
              <p className="text-[11px] text-text-muted">{field.helper_text}</p>
            )}
            <textarea
              rows={3}
              data-testid={`brief-input-${field.id}`}
              value={typeof currentValue === 'string' ? currentValue : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
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
                {field.is_required && <span className="text-destructive">*</span>}
              </label>
              {renderVisibilityBadge()}
            </div>
            {field.helper_text && (
              <p className="text-[11px] text-text-muted">{field.helper_text}</p>
            )}
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
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        );
    }
  }

  // ── Read Only / Canonical Display Mode ────────────────────────────────────
  return (
    <div
      data-testid={`brief-field-item-${field.id}`}
      className="space-y-1 rounded-xl border border-border/80 bg-surface p-3 transition-colors hover:border-border-subtle"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {getFieldIcon(field.field_type)}
          <span className="text-xs font-bold text-text-primary">{field.label}</span>
          {field.is_required && <span className="text-[10px] text-destructive font-bold">*</span>}
        </div>
        {renderVisibilityBadge()}
      </div>

      {field.helper_text && <p className="text-[11px] text-text-muted">{field.helper_text}</p>}

      <div className="pt-0.5">
        {currentValue !== null &&
        currentValue !== undefined &&
        String(currentValue).trim() !== '' ? (
          field.field_type === 'url' ? (
            <a
              href={String(currentValue)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1 truncate"
            >
              <Link2 className="h-3 w-3 shrink-0" />
              {String(currentValue)}
            </a>
          ) : field.field_type === 'checkbox' ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary">
              <CheckSquare className="h-3.5 w-3.5 text-primary" />
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
