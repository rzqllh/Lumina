import React, { useState } from 'react';
import {
  useGenerateProjectStatusShareLink,
  useRevokeProjectShareLink,
} from '../hooks/useFileMutations';
import { X, Share2, Copy, Check, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ContextHelp } from '@/components/ui/context-help';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div
        data-testid="share-project-status-modal"
        className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-sheet space-y-5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary-text" strokeWidth={1.75} />
              <span>Live Client Status Portal</span>
              <ContextHelp
                title="Public Status Portal Privacy"
                description="Clients view live timelines, sessions, approved deliverables, and shared file links. Financial amounts, payment milestones, expenses, collaborator fees, and internal notes are strictly hidden."
                guideAnchor="#files-sharing"
                testId="share-status-privacy-help"
              />
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Share live shoot schedules, stage progress, and approved deliverable media links with
              your client
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-status-success-border bg-status-success-subtle p-3.5 text-xs text-status-success-text space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-status-success-text">
              <ShieldCheck
                className="h-4 w-4 text-status-success-text shrink-0"
                strokeWidth={1.75}
              />
              <span>Commercial & Privacy Safe</span>
            </div>
            <p className="text-xs text-status-success-text/90 leading-relaxed">
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
            <div className="rounded-lg border border-status-danger-border bg-status-danger-subtle p-3 text-xs text-status-danger-text">
              {errorMessage}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Portal Link URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  data-testid="status-share-url-input"
                  value={shareUrl || ''}
                  className="w-full rounded-lg border border-border bg-surface-muted/50 px-3 py-2 text-xs font-mono text-text-primary select-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  data-testid="copy-status-link-btn"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover shadow-subtle transition-colors cursor-pointer shrink-0"
                >
                  {hasCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5" strokeWidth={2} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
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
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary-text hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
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
              className="flex items-center gap-1.5 rounded-lg border border-status-danger-border bg-status-danger-subtle px-3 py-1.5 text-xs font-semibold text-status-danger-text hover:bg-status-danger-subtle/80 transition-colors cursor-pointer disabled:opacity-50"
            >
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} />
              {revokeMutation.isPending ? 'Revoking...' : 'Revoke Link'}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
