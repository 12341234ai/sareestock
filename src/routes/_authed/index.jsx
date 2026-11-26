import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock,
  FolderOpen,
  Images,
  PlusCircle,
  ScanSearch,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SareeCard from "@/components/saree/SareeCard";
import SareeViewer from "@/components/saree/SareeViewer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { cleanupExpired, fetchDashboard } from "@/lib/data";

export const Route = createFileRoute("/_authed/")({
  head: () => ({ meta: [{ title: "Dashboard — Arunika" }] }),
  component: DashboardPage,
});

const QUICK_ACTIONS = [
  { label: "Add New Saree", to: "/add", icon: PlusCircle },
  { label: "View Gallery", to: "/gallery", icon: Images },
  { label: "Search Sarees", to: "/search", icon: ScanSearch },
  { label: "Manage Groups", to: "/groups", icon: FolderOpen },
];

function DashboardPage() {
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, loading, reload } = useAsyncData(async () => {
    await cleanupExpired();
    return fetchDashboard();
  }, []);

  const stats = [
    {
      label: "Total Sarees",
      value: data?.total,
      icon: Images,
      hint: "Saved in your catalogue",
    },
    {
      label: "Supplier Groups",
      value: data?.groups,
      icon: FolderOpen,
      hint: "Collections you organise",
    },
    {
      label: "Expiring Soon",
      value: data?.expiring,
      icon: Clock,
      hint: "Within the next 7 days",
      tone: "warn",
    },
    {
      label: "Recently Added",
      value: data?.recent,
      icon: TrendingUp,
      hint: "Last 7 days",
    },
  ];

  const latest = data?.latest || [];

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="surface relative overflow-hidden px-5 py-6 sm:px-8 sm:py-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-secondary"
        />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-primary">
            <Sparkles className="h-3 w-3" /> Saree Catalogue
          </span>
          <h1 className="mt-4 font-heading text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.1] text-[hsl(var(--plum))]">
            Welcome, Aruna!
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-6 text-foreground/70 sm:text-[15px]">
            Every saree has a story. Every detail has a place.
          </p>
          <p className="mt-3 font-heading text-[12px] italic text-muted-foreground">
            Made with love for Aruna, Nainika, Darshi &amp; Kishore.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {QUICK_ACTIONS.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className={
                    index === 0
                      ? "inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-4 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
                      : "inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-card px-4 text-[14px] font-medium text-[hsl(var(--plum))] transition-colors hover:bg-secondary"
                  }
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="surface p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  {stat.label}
                </span>
                <span
                  className={
                    stat.tone === "warn"
                      ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDF3E1] text-[#B4741A]"
                      : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"
                  }
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 font-heading text-[clamp(1.6rem,4vw,2.25rem)] leading-none text-[hsl(var(--plum))]">
                {loading || stat.value === undefined ? "—" : stat.value}
              </p>
              <p className="mt-2 text-[12px] leading-4 text-muted-foreground">{stat.hint}</p>
            </div>
          );
        })}
      </section>

      {data?.expiring ? (
        <Link
          to="/gallery"
          className="flex items-center justify-between gap-3 rounded-2xl border border-[#F3DDB4] bg-[#FDF3E1] px-4 py-3 text-[13px] text-[#8A5A12]"
        >
          <span>
            {data.expiring === 1
              ? "1 saree expires within 7 days."
              : `${data.expiring} sarees expire within 7 days.`}
          </span>
          <span className="shrink-0 font-medium underline">Review</span>
        </Link>
      ) : null}

      <section className="surface p-5 sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-[20px] text-[hsl(var(--plum))]">Recently added</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              The last four sarees you saved.
            </p>
          </div>
          <Link to="/gallery" className="shrink-0 text-[13px] font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        {latest.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {latest.map((saree) => (
              <SareeCard key={saree.id} saree={saree} onOpen={setDetail} />
            ))}
          </div>
        ) : loading ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((slot) => (
              <div key={slot} className="h-56 animate-pulse rounded-2xl border border-border bg-secondary/50" />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              icon={Images}
              title="Your catalogue is empty"
              description="Create a supplier group, then add your first saree with its photo, Item ID and prices."
              action={
                <Link
                  to="/add"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-medium text-primary-foreground"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add your first saree
                </Link>
              }
            />
          </div>
        )}
      </section>

      <SareeViewer
        detail={detail}
        onDetailChange={setDetail}
        deleteTarget={deleteTarget}
        onDeleteTargetChange={setDeleteTarget}
        onDeleted={reload}
      />
    </div>
  );
}