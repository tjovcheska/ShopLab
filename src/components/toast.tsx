"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** Every toast disappears this long after it appears. */
export const TOAST_DURATION_MS = 3000;

type ToastInput = { title: string; description?: string };
type Toast = ToastInput & { id: number };

const ToastContext = createContext<(toast: ToastInput) => void>(() => {});

/** Returns a function that shows a toast: showToast({ title, description }). */
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const showToast = useCallback((toast: ToastInput) => {
    const id = nextId.current++;
    setToasts((list) => [...list, { ...toast, id }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext value={showToast}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-80 flex-col gap-2"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      data-testid="toast"
      className="pointer-events-auto flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
    >
      <div className="flex-1">
        <p className="font-semibold">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-gray-600">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-700"
      >
        ×
      </button>
    </div>
  );
}
