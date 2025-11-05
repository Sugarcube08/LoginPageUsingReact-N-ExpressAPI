import React from "react";
import { Outlet } from "react-router-dom";
import type { ToastCategory } from "../types/typeTheme";

interface ToastMessage {
  id: number;
  category: ToastCategory;
  message: string;
}

interface ThemeProps {
  children?: React.ReactNode;
  messages?: ToastMessage[];
}

const Theme: React.FC<ThemeProps> = ({ messages = [] }) => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>(messages);

  React.useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => setToasts([]), 2400);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const getToastBg = (category: ToastCategory): string => {
    switch (category) {
      case "success":
        return "bg-emerald-600";
      case "error":
        return "bg-rose-600";
      case "info":
        return "bg-sky-600";
      default:
        return "bg-slate-700";
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-slate-200/15 blur-3xl" />
        <div className="absolute top-1/3 right-[-6rem] h-96 w-96 rounded-full bg-emerald-400/15 blur-[140px]" />
        <div className="absolute bottom-[-8rem] left-[-4rem] h-[22rem] w-[22rem] rounded-full bg-sky-400/10 blur-[160px]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>

      {toasts.length > 0 && (
        <div className="fixed top-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 space-y-3 px-4">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`rounded-xl px-4 py-3 text-center text-slate-50 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.9)] ring-1 ring-white/10 backdrop-blur ${getToastBg(
                toast.category
              )}`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-12">
        <div className="relative w-full rounded-[2.2rem] border border-slate-800/60 bg-slate-900/60 shadow-[0_60px_160px_-80px_rgba(8,28,74,0.95)]">
          <div className="absolute inset-px rounded-[2.1rem] bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-800/80" />
          <div className="absolute -top-8 right-10 hidden h-32 w-32 rounded-full bg-emerald-400/25 blur-2xl lg:block" />
          <div className="absolute bottom-0 left-10 hidden h-40 w-40 rounded-full bg-slate-200/10 blur-3xl lg:block" />
          <section className="relative flex w-full items-center justify-center overflow-hidden px-6 py-12 sm:px-8 lg:px-14">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Theme;
