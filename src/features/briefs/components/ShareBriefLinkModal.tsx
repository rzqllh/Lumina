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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div
        data-testid="share-brief-link-modal"
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              Client Intake Form Link
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Send this private link to your client to fill out questionnaire questions
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
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Safe Client Projection</span>
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Clients will only see questions marked as Client View or Client Fill. Internal notes,
              pricing, and crew costs are completely hidden.
            </p>
          </div>

          {generateLinkMutation.isPending ? (
            <div className="py-6 text-center text-xs text-text-muted">
              Generating secure link...
            </div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-primary">
                Shareable Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  data-testid="share-url-input"
                  value={shareUrl || ''}
                  className="w-full rounded-xl border border-border bg-surface-muted/50 px-3 py-2 text-xs font-mono text-text-primary select-all focus:outline-none"
                />
                <button
                  type="button"
                  data-testid="copy-link-btn"
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
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
