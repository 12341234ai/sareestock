import { createFileRoute } from "@tanstack/react-router";
import { Database, Lock } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import BackupCard from "@/components/settings/BackupCard";
import ClearDataCard from "@/components/settings/ClearDataCard";
import RestoreCard from "@/components/settings/RestoreCard";
import { useAsyncData } from "@/hooks/useAsyncData";
import { countGroups, countSarees } from "@/lib/data";

export const Route = createFileRoute("/_authed/settings")({
  head: () => ({ meta: [{ title: "Settings — Arunika" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: counts, reload } = useAsyncData(async () => {
    const [sarees, groups] = await Promise.all([countSarees(), countGroups()]);
    return { sarees, groups };
  }, []);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Back up your catalogue, restore an earlier backup, or start fresh."
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <BackupCard counts={counts} />
        <RestoreCard onRestored={reload} />
      </div>

      <div className="mt-3">
        <ClearDataCard counts={counts} onCleared={reload} />
      </div>

      <div className="surface mt-3 space-y-3 p-4 sm:p-5">
        <h2 className="flex items-center gap-2 font-heading text-[17px] text-[hsl(var(--plum))]">
          <Lock className="h-4 w-4 text-primary" />
          Your data and privacy
        </h2>
        <p className="text-[13px] leading-5 text-foreground/70">
          Your catalogue and saree photos are saved in this browser on this device. No account is
          needed, nothing is uploaded, and photo matching happens here too.
        </p>
        <p className="flex items-start gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-[12px] leading-5 text-foreground/70">
          <Database className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          Clearing this browser&apos;s data, or browsing in a private window, will remove your
          catalogue. Export a backup now and then, and use it to move your sarees to another device.
        </p>
        <div className="border-t border-border pt-3 text-center">
          <p className="font-heading text-[12px] italic text-muted-foreground">
            Made with love for Aruna, Nainika, Darshi &amp; Kishore.
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/80">
            Made by Max Verstappen (Charish)
          </p>
        </div>
      </div>
    </div>
  );
}