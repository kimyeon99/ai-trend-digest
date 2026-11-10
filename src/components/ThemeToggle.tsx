"use client";

import { useSyncExternalStore } from "react";

import SquishSwitch from "@/components/SquishSwitch";

// Re-render whenever the `dark` class on <html> changes
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function isDark() {
  return document.documentElement.classList.contains("dark");
}

function setDark(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    // Storage can be blocked (private mode); the toggle still works for this page view
  }
}

export function ThemeToggle() {
  // The server can't know the visitor's theme, so it renders an empty slot (null) and the
  // switch appears after hydration already in the right position, instead of sliding there
  const dark = useSyncExternalStore(subscribe, isDark, () => null);

  return (
    <span className="flex items-center gap-2">
      {/* Tells what the switch is for; the switch itself carries the aria-label */}
      <span className="text-muted" aria-hidden="true">
        ☾
      </span>
      {dark === null ? (
        <span className="h-6 w-11" aria-hidden="true" />
      ) : (
        <SquishSwitch
          checked={dark}
          onChange={setDark}
          ariaLabel="다크 모드"
          width={44}
          height={24}
          radius={12}
          trackColor="var(--border)"
          trackOnColor="var(--foreground)"
          thumbColor="var(--card)"
        />
      )}
    </span>
  );
}
