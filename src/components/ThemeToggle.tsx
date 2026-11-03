"use client";

export function ThemeToggle() {
  function toggle() {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // Storage can be blocked (private mode); the toggle still works for this page view
    }
  }

  // Icons switch with CSS so the server and client render the same markup
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="다크 모드 전환"
      className="rounded-md px-2 py-1 text-muted hover:bg-border hover:text-foreground"
    >
      <span className="dark:hidden">☾</span>
      <span className="hidden dark:inline">☀</span>
    </button>
  );
}
