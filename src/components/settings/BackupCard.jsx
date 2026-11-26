import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildBackup, downloadJson } from "@/lib/backup";

export default function BackupCard({ counts }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [message, setMessage] = useState("");

  const handleExport = async () => {
    setBusy(true);
    setMessage("");
    setProgress("Preparing backup…");
    try {
      const { backup, missingPhotos } = await buildBackup((done, total) => {
        setProgress(total ? `Embedding photo ${done} of ${total}…` : "Preparing backup…");
      });
      downloadJson(backup, `arunika-backup-${new Date().toISOString().slice(0, 10)}.json`);
      setMessage(
        missingPhotos
          ? `${backup.sarees.length} listings exported, but ${missingPhotos} photo(s) could not be embedded.`
          : `${backup.sarees.length} listings and ${backup.groups.length} groups exported with their photos.`,
      );
      toast.success("Backup downloaded.");
    } catch {
      toast.error("The backup could not be created. Please try again.");
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  return (
    <section className="surface flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <Download className="h-[18px] w-[18px]" />
        </span>
        <div>
          <h2 className="font-heading text-[18px] text-[hsl(var(--plum))]">Export backup</h2>
          <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
            Downloads one JSON file with your groups, Item IDs, prices, dates and the saree photos
            themselves.
          </p>
        </div>
      </div>

      <p className="text-[12px] text-foreground/65">
        {counts ? `${counts.sarees} listings · ${counts.groups} groups` : "Loading counts…"}
      </p>

      {busy && progress ? (
        <p className="flex items-center gap-2 text-[12px] text-[hsl(var(--plum))]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {progress}
        </p>
      ) : null}
      {message ? <p className="text-[12px] leading-5 text-[#2F7A55]">{message}</p> : null}

      <Button
        className="h-11 w-full rounded-full bg-primary text-primary-foreground sm:w-auto sm:self-start sm:px-5"
        onClick={handleExport}
        disabled={busy}
      >
        <Download className="mr-2 h-4 w-4" />
        {busy ? "Creating backup…" : "Export backup"}
      </Button>
    </section>
  );
}