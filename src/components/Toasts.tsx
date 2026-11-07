import { useStore } from "../state/store";

/** Visual toasts plus one polite live region used for all screen-reader announcements. */
export function Toasts() {
  const { toasts, dismissToast, announcement } = useStore();
  return (
    <>
      <div className="toasts" data-testid="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.tone === "error" ? "toast--error" : ""}`} data-testid="toast">
            <span>{t.message}</span>
            {t.action ? (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick();
                  dismissToast(t.id);
                }}
              >
                {t.action.label}
              </button>
            ) : (
              <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dismiss notification">
                Close
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true" data-testid="live-region">
        {announcement}
      </div>
    </>
  );
}
