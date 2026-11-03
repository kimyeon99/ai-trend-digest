"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";

// Closing goes back in history, so the browser back button closes the modal too
export function Modal({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    // showModal (not the open attribute) gives the backdrop, focus trap and Esc key
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    // Next keeps a route it navigated away from in the DOM, hidden, to restore it on back/forward.
    // A hidden dialog would stay open over the page, so close it whenever this effect is torn down
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label="논문 상세"
      onCancel={(e) => {
        e.preventDefault();
        router.back();
      }}
      // A click on the dialog element itself (not its content) is a click on the backdrop
      onClick={(e) => {
        if (e.target === e.currentTarget) router.back();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(720px,calc(100%-2rem))] rounded-2xl bg-card text-foreground backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-2 p-6">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="닫기"
          className="self-end rounded-md px-2 py-1 text-muted hover:bg-border hover:text-foreground"
        >
          ✕
        </button>
        {children}
      </div>
    </dialog>
  );
}
