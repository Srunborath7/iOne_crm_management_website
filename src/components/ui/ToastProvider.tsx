"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info" | "confirm";
type ToastItem = { id: number; kind: ToastKind; message: string };
type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  confirm: (message: string) => Promise<boolean>;
  clear: () => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const styles: Record<ToastKind, { icon: typeof Info; className: string }> = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  error: {
    icon: AlertCircle,
    className: "border-red-200 bg-red-50 text-red-900",
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-900",
  },
  confirm: {
    icon: Info,
    className: "border-blue-200 bg-white text-slate-900",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const confirmations = useRef(new Map<number, (accepted: boolean) => void>());

  const finishConfirmation = useCallback((id: number, accepted: boolean) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
    const resolve = confirmations.current.get(id);
    confirmations.current.delete(id);
    resolve?.(accepted);
  }, []);

  const dismiss = useCallback((id: number) => {
    const resolve = confirmations.current.get(id);
    if (resolve) {
      finishConfirmation(id, false);
      return;
    }
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, [finishConfirmation]);

  const clear = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
    confirmations.current.forEach((resolve) => resolve(false));
    confirmations.current.clear();
    setItems([]);
  }, []);

  const add = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++nextId.current;
      setItems((current) => [...current, { id, kind, message }]);
      timers.current.set(id, setTimeout(() => dismiss(id), 4500));
    },
    [dismiss],
  );

  const confirm = useCallback(
    (message: string) =>
      new Promise<boolean>((resolve) => {
        const id = ++nextId.current;
        confirmations.current.set(id, resolve);
        setItems((current) => [...current, { id, kind: "confirm", message }]);
        timers.current.set(id, setTimeout(() => finishConfirmation(id, false), 15000));
      }),
    [finishConfirmation],
  );

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => add("success", message),
      error: (message) => add("error", message),
      info: (message) => add("info", message),
      confirm,
      clear,
    }),
    [add, clear, confirm],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6"
        aria-live="polite"
        aria-relevant="additions"
      >
        {items.map((item) => {
          const { icon: Icon, className } = styles[item.kind];
          return (
            <div
              key={item.id}
              role={item.kind === "error" ? "alert" : item.kind === "confirm" ? "group" : "status"}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${className}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="flex-1 text-sm font-medium leading-5">{item.message}</p>
              {item.kind === "confirm" ? (
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => finishConfirmation(item.id, false)}
                    className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => finishConfirmation(item.id, true)}
                    className="rounded-md bg-[#10294B] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#183a69] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    Confirm
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  aria-label="Dismiss notification"
                  className="-mr-1 -mt-1 rounded-md p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used inside ToastProvider.");
  return toast;
}
