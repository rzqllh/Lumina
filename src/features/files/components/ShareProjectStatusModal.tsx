import React, { useState } from 'react';
import {
  useGenerateProjectStatusShareLink,
  useRevokeProjectShareLink,
} from '../hooks/useFileMutations';
import { X, Share2, Copy, Check, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ShareProjectStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  projectId: string;
}

export const ShareProjectStatusModal: React.FC<ShareProjectStatusModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  projectId,
}) => {
  const generateLinkMutation = useGenerateProjectStatusShareLink();
  const revokeMutation = useRevokeProjectShareLink(workspaceId, projectId);

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [currentLinkId, setCurrentLinkId] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generateLinkRef = React.useRef(generateLinkMutation.mutateAsync);
  generateLinkRef.current = generateLinkMutation.mutateAsync;

  React.useEffect(() => {
    if (isOpen && projectId) {
      setShareUrl(null);
      setCurrentLinkId(null);
      setHasCopied(false);
      setErrorMessage(null);

      generateLinkRef
        .current(projectId)
        .then((res) => {
          setCurrentLinkId(res.link_id);
          if (res.raw_token) {
            setShareUrl(`${window.location.origin}/share/${res.raw_token}`);
          } else {
            setShareUrl(`${window.location.origin}/share/active-status`);
          }
        })
        .catch((err) => {
          setErrorMessage(err?.message || 'Failed to generate status link');
        });
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  async function handleCopy() {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  }

  async function handleRevoke() {
    if (currentLinkId) {
      await revokeMutation.mutateAsync(currentLinkId);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div
        data-testid="share-project-status-modal"
        className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              Live Client Status Portal
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Share live shoot schedules, stage progress, and approved deliverable media links with
              your client
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Commercial & Privacy Safe</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Your client sees only operational milestones: shoot dates, delivery progress, and
              client-visible download links. All internal financials, profit margins, costs, and
              private studio notes are strictly omitted.
            </p>
          </div>

          {generateLinkMutation.isPending ? (
            <div className="py-6 text-center text-xs text-text-muted">
              Generating secure status link...
            </div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-primary">
                Portal Link URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  data-testid="status-share-url-input"
                  value={shareUrl || ''}
                  className="w-full rounded-xl border border-border bg-surface-muted/50 px-3 py-2 text-xs font-mono text-text-primary select-all focus:outline-none"
                />
                <button
                  type="button"
                  data-testid="copy-status-link-btn"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shrink-0"
                >
                  {hasCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {shareUrl && (
                <div className="pt-1">
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open client view in new tab
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          {currentLinkId && (
            <button
              type="button"
              disabled={revokeMutation.isPending}
              data-testid="revoke-status-link-btn"
              onClick={handleRevoke}
              className="flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {revokeMutation.isPending ? 'Revoking...' : 'Revoke Link'}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
