
import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LockKeyhole, LogOut, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { MOBILE_NAV, NAV_ITEMS, isNavActive } from "./nav-items";

const LOGIN_USERNAME = "Arunika designers";
const LOGIN_PASSWORD = "sixtwofourfiveonetwo";
const SESSION_KEY = "arunika_unlocked";

function LoginScreen({ onUnlock }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (
      username.trim() === LOGIN_USERNAME &&
      password === LOGIN_PASSWORD
    ) {
      onUnlock();
      return;
    }

    setError("Incorrect username or password. Please try again.");
    setPassword("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="surface w-full max-w-md p-7 sm:p-9">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
            <LockKeyhole className="h-7 w-7" />
          </div>

          <h1 className="brand-wordmark text-2xl font-semibold uppercase">
            Arunika
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your saree catalogue, protected.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="arunika-username"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Username
            </label>
            <input
              id="arunika-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError("");
              }}
              placeholder="Enter username"
              required
              className="min-h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div>
            <label
              htmlFor="arunika-password"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="arunika-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Enter password"
              required
              className="min-h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="min-h-12 w-full rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Unlock Arunika
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
          Every saree has a story. Every detail has a place.
        </p>
      </section>
    </main>
  );
}

function Wordmark({ size = "lg" }) {
  return (
    <span
      className={cn(
        "brand-wordmark font-semibold uppercase",
        size === "lg" ? "text-[20px]" : "text-[17px]",
      )}
    >
      Arunika
    </span>
  );
}

export default function AppShell({ children }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(
    () =>
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(SESSION_KEY) === "true",
  );

  function unlock() {
    window.sessionStorage.setItem(SESSION_KEY, "true");
    setUnlocked(true);
  }

  function lock() {
    window.sessionStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
    setMenuOpen(false);
  }

  if (!unlocked) {
    return <LoginScreen onUnlock={unlock} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-border bg-white/70 px-5 py-7 backdrop-blur lg:flex">
        <Link to="/" className="mb-1 flex flex-col gap-1 px-2">
          <Wordmark />
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Saree Catalogue
          </span>
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item, pathname);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors",
                  active
                    ? "bg-secondary font-medium text-[hsl(var(--plum))]"
                    : "text-foreground/70 hover:bg-secondary/60 hover:text-[hsl(var(--plum))]",
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    active
                      ? "text-primary"
                      : "text-foreground/45 group-hover:text-primary",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 space-y-3 border-t border-border pt-5">
          <p className="px-2 font-heading text-[12px] leading-5 text-muted-foreground">
            Made with love for Aruna, Nainika, Darshi &amp; Kishore.
          </p>

          <p className="px-2 text-[11px] leading-4 text-muted-foreground/80">
            Made by Max Verstappen (Charish)
          </p>

          <button
            type="button"
            onClick={lock}
            className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-medium text-foreground/70 transition hover:bg-secondary hover:text-primary"
          >
            <LockKeyhole className="h-4 w-4" />
            Lock Arunika
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/" className="flex flex-col">
          <Wordmark size="sm" />
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Saree Catalogue
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={lock}
            aria-label="Lock Arunika"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-[hsl(var(--plum))]"
          >
            <LockKeyhole className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-[hsl(var(--plum))]"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-[280px] bg-card">
          <SheetHeader>
            <SheetTitle className="brand-wordmark text-left text-[16px] uppercase">
              Arunika
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item, pathname);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px]",
                    active
                      ? "bg-secondary font-medium text-[hsl(var(--plum))]"
                      : "text-foreground/75",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px]",
                      active ? "text-primary" : "text-foreground/45",
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 space-y-3 border-t border-border pt-5">
            <p className="font-heading text-[12px] leading-5 text-muted-foreground">
              Made with love for Aruna, Nainika, Darshi &amp; Kishore.
            </p>

            <button
              type="button"
              onClick={lock}
              className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-medium text-foreground/70 hover:bg-secondary hover:text-primary"
            >
              <LogOut className="h-4 w-4" />
              Lock Arunika
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <main className="lg:pl-[260px]">
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-5 sm:px-6 lg:px-6 lg:pb-12 lg:pt-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-1 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item, pathname);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px]",
                  active ? "text-primary" : "text-foreground/55",
                )}
              >
                <Icon className="h-[20px] w-[20px]" />
                <span className={active ? "font-medium" : ""}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
