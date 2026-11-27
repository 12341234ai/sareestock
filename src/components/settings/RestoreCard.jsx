import { useRef, useState } from "react";
import { FileCheck2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { restoreBackup, validateBackup } from "@/lib/backup";
import { formatDate } from "@/lib/sareeUtils";

export default function RestoreCard({ onRestored }) {
  const inputRef = useRef(null);
  const [pending, setPending] = useState(null);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [done, setDone] = useState("");

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setErrors([]);
    setPending(null);
    setDone("");

    try {
      const text = await file.text();

      let parsed;

      try {
        parsed = JSON.parse(text);
      } catch {
        setErrors([
          "This file is not valid JSON, so it cannot be an Arunika backup.",
        ]);
        return;
      }

      const validated = validateBackup(parsed);

      if (!validated.ok) {
        setErrors(validated.errors);
        return;
      }

      setPending(validated);
    } catch {
      setErrors(["This file could not be read."]);
    }
  };

  const confirmRestore = async () => {
    if (!pending) return;

    setBusy(true);
    setProgress("Restoring…");

    try {
      const result = await restoreBackup(
        pending,
        (current, total) =>
          setProgress(`Restoring saree ${current} of ${total}…`),
      );

      setDone(
        `${result.sarees} listings and ${result.groups} new groups restored.`,
      );

      toast.success(`${result.sarees} sarees restored.`);
      setPending(null);
      onRestored?.();
    } catch {
      toast.error(
        "The restore failed. Your existing data was left unchanged.",
      );
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  return (
    <section className="surface flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <FileCheck2 className="h-[18px] w-[18px]" />
        </span>

        <div>
          <h2 className="font-heading text-[18px] text-[hsl(var(--plum))]">
            Restore backup
          </h2>

          <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
            Choose an Arunika backup file. It is checked first, then added
            to your catalogue. Your current sarees are never replaced.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFile}
      />

      {errors.length ? (
        <div className="rounded-xl border border-[#F2C9C5] bg-[#FBE6E4] px-3 py-2.5">
          <p className="text-[12px] font-medium text-[#B0453C]">
            This backup could not be restored:
          </p>

          <ul className="mt-1 list-disc space-y-1 pl-4 text-[12px] leading-5 text-[#B0453C]">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {done ? (
        <p className="text-[12px] leading-5 text-[#2F7A55]">
          {done}
        </p>
      ) : null}

      {busy && progress ? (
        <p className="flex items-center gap-2 text-[12px] text-[hsl(var(--plum))]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {progress}
        </p>
      ) : null}

      <Button
        variant="outline"
        className="h-11 w-full rounded-full border-border text-[hsl(var(--plum))] sm:w-auto sm:self-start sm:px-5"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        <Upload className="mr-2 h-4 w-4" />
        Choose backup file
      </Button>

      <Dialog
        open={!!pending}
        onOpenChange={(open) => {
          if (!open && !busy) setPending(null);
        }}
      >
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-md rounded-2xl border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-[20px] text-[hsl(var(--plum))]">
              Restore this backup?
            </DialogTitle>

            <DialogDescription className="text-[13px] leading-5">
              The file passed every check. These listings will be added
              to your catalogue.
            </DialogDescription>
          </DialogHeader>

          {pending ? (
            <div className="space-y-2 rounded-xl border border-border bg-background/60 p-3 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listings</span>
                <span className="font-medium text-[hsl(var(--plum))]">
                  {pending.counts.sarees}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Groups</span>
                <span className="font-medium text-[hsl(var(--plum))]">
                  {pending.counts.groups}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Exported</span>
                <span className="font-medium text-[hsl(var(--plum))]">
                  {formatDate(pending.exportedAt)}
                </span>
              </div>

              <p className="pt-1 text-[12px] leading-5 text-muted-foreground">
                Restored sarees will remain saved until you manually delete
                them.
              </p>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="h-11 rounded-full border-border"
              onClick={() => setPending(null)}
              disabled={busy}
            >
              Cancel
            </Button>

            <Button
              className="h-11 rounded-full bg-primary px-5 text-primary-foreground"
              onClick={confirmRestore}
              disabled={busy}
            >
              {busy ? "Restoring…" : "Restore now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}