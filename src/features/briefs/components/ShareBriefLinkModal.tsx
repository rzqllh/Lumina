import React, { useState } from 'react';
import { useGenerateBriefShareLink } from '../hooks/useBriefMutations';
import { X, Share2, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';

interface ShareBriefLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const ShareBriefLinkModal: React.FC<ShareBriefLinkModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const generateLinkMutation = useGenerateBriefShareLink();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generateLinkRef = React.useRef(generateLinkMutation.mutateAsync);
  generateLinkRef.current = generateLinkMutation.mutateAsync;

  React.useEffect(() => {
    if (isOpen && projectId) {
      setShareUrl(null);
      setHasCopied(false);
      setErrorMessage(null);

      generateLinkRef
        .current(projectId)
        .then((res) => {
          if (res.raw_token) {
            const fullUrl = `${window.location.origin}/brief/${res.raw_token}`;
            setShareUrl(fullUrl);
          } else {
            // Existing link without exposed raw token, generate fresh share link or inform user
            setShareUrl(`${window.location.origin}/brief/active-link`);
          }
        })
        .catch((err) => {
          setErrorMessage(err?.message || 'Failed to generate share link');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
      <div
        data-testid="share-brief-link-modal"
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sheet space-y-5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary-text border border-primary-border">
              <Share2 className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Client Intake Form Link</h2>
              <p className="text-xs text-text-secondary">
                Send this private link to your client to fill out questionnaire questions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-status-info-border bg-status-info-subtle p-3 text-xs text-status-info-text space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="h-4 w-4 text-status-info-text shrink-0" strokeWidth={1.75} />
              <span>Safe Client Projection</span>
            </div>
            <p className="text-xs text-status-info-text/90 leading-relaxed">
              Clients will only see questions marked as Client View or Client Fill. Internal notes,
              pricing, and crew costs are completely hidden.
            </p>
          </div>

          {generateLinkMutation.isPending ? (
            <div className="py-6 text-center text-xs text-text-muted">
              Generating secure link...
            </div>
          ) : errorMessage ? (
            <div className="rounded-lg border border-status-danger-border bg-status-danger-subtle p-3 text-xs text-status-danger-text">
              {errorMessage}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                Shareable Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  data-testid="share-url-input"
                  value={shareUrl || ''}
                  className="w-full rounded-lg border border-border bg-surface-muted/50 px-3 py-2 text-xs font-mono text-text-primary select-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  data-testid="copy-link-btn"
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
                    Preview client intake form in new tab
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
