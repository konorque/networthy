import { useEffect, useRef, useState } from 'react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Ref to the real <dialog> DOM element: showModal()/close() are browser methods,
  // React has no prop for them
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Texts shown on screen. Updated only while open, so during the close animation
  // the dialog keeps the last texts instead of flashing "undefined".
  // (Same "setState during render" pattern as `visit` in RequireAuth.)
  const [shown, setShown] = useState({ title, message });
  if (open && (shown.title !== title || shown.message !== message)) {
    setShown({ title, message });
  }

  // Sync the `open` prop with the native dialog.
  // showModal() gives us the dimmed backdrop, Esc to close and a focus trap for free.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      // Fires on Esc and on close(): tell the parent the dialog is gone
      onClose={onCancel}
      // A click whose target is the <dialog> itself landed on the backdrop
      // (content lives in the inner div), so treat it as Cancel
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      // Fade + slight zoom in/out. `open:` = shown state, `starting:open:` = the frame before it
      // appears (@starting-style). transition-discrete lets display/overlay wait for the
      // exit animation instead of hiding the dialog instantly.
      className={[
        'm-auto w-full max-w-sm rounded-xl border border-line bg-surface p-0 text-ink shadow-xl',
        'scale-95 opacity-0 open:scale-100 open:opacity-100',
        'starting:open:scale-95 starting:open:opacity-0',
        'transition-[opacity,scale,overlay,display] transition-discrete duration-300 ease-out',
        'backdrop:bg-transparent open:backdrop:bg-ink/40 starting:open:backdrop:bg-transparent',
        'backdrop:transition-[background-color,overlay,display] backdrop:transition-discrete backdrop:duration-300',
      ].join(' ')}
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold">{shown.title}</h2>
        <p className="mt-2 text-sm text-muted">{shown.message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 font-medium text-muted transition-colors hover:bg-accent-faint hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-lg bg-accent px-4 py-2 font-medium text-ink transition-colors hover:text-danger disabled:opacity-60"
          >
            {pending ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
