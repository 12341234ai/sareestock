import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarClock,
  Camera,
  Database,
  Download,
  FileCheck2,
  FolderOpen,
  ImagePlus,
  IndianRupee,
  Search,
  ShieldAlert,
  Tag,
  Trash2,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";

export const Route = createFileRoute("/_authed/how-to-use")({
  head: () => ({ meta: [{ title: "How to Use — Arunika" }] }),
  component: HowToUsePage,
});

const STEPS = [
  {
    icon: FolderOpen,
    title: "Create supplier groups",
    body: "Tap New group in Groups and name it, like Silk Saree Suppliers.",
  },
  {
    icon: ImagePlus,
    title: "Upload sarees",
    body: "Open Add Sarees and pick one photo or many.",
  },
  {
    icon: Tag,
    title: "Enter Item IDs",
    body: "Type the Item ID for each saree, like AR101.",
  },
  {
    icon: IndianRupee,
    title: "Enter selling prices",
    body: "Enter the price you quote to resellers, in rupees.",
  },
  {
    icon: IndianRupee,
    title: "Enter purchase prices",
    body: "Enter what you paid for the saree.",
  },
  {
    icon: Search,
    title: "View the Gallery",
    body: "The Gallery shows every saree, with search, group filter and sorting.",
  },
  {
    icon: Camera,
    title: "Search using photos",
    body: "Upload a reference photo and Arunika lists the closest sarees.",
  },
  {
    icon: ShieldAlert,
    title: "Identify duplicate Item IDs",
    body: "A warning shows the existing saree if an Item ID is already used.",
  },
  {
    icon: CalendarClock,
    title: "How expiry works",
    body: "Each listing lasts 30 days, with warnings at 7, 3 and 1 day left.",
  },
  {
    icon: Download,
    title: "Export backups",
    body: "Tap Export Backup in Settings to download one file with your photos.",
  },
  {
    icon: FileCheck2,
    title: "Restore backups",
    body: "Pick a backup file in Settings and confirm to restore it.",
  },
  {
    icon: Trash2,
    title: "Clear data",
    body: "Clear all data deletes every saree, group and photo.",
  },
];

function HowToUsePage() {
  return (
    <div>
      <PageHeader
        title="How to Use Arunika"
        description="Twelve short steps, from your first group to your last backup."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="surface flex gap-3 p-4">
              <div className="flex flex-col items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-[13px] font-semibold text-[hsl(var(--plum))]">
                  {index + 1}
                </span>
                <Icon className="h-4 w-4 text-primary/70" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-[16px] text-[hsl(var(--plum))]">{step.title}</h3>
                <p className="mt-1 text-[13px] leading-5 text-foreground/70">{step.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="surface mt-4 space-y-2 p-4">
        <h3 className="flex items-center gap-2 font-heading text-[16px] text-[hsl(var(--plum))]">
          <Database className="h-4 w-4 text-primary" />
          Where your data lives
        </h3>
        <p className="text-[13px] leading-5 text-foreground/70">
          Your catalogue and photos are saved in this browser on this device, and nothing is uploaded.
        </p>
        <p className="text-[13px] leading-5 text-foreground/70">
          Clearing browser data will erase it, so export a backup now and then.
        </p>
      </div>

      <div className="surface mt-4 flex flex-col gap-1 p-4 text-center">
        <p className="font-heading text-[13px] italic text-muted-foreground">
          Made with love for Aruna, Nainika, Darshi &amp; Kishore.
        </p>
        <p className="text-[11px] text-muted-foreground/80">Made by Max Verstappen (Charish)</p>
      </div>
    </div>
  );
}