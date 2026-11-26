import { useState } from "react";
import { ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { clearEverything } from "@/lib/data";
import { clearSignedUrlCache } from "@/lib/signedUrls";

export default function ClearDataCard({ counts, onCleared }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleClear = async () => {
    setBusy(true);
    try {
      await clearEverything();
      clearSignedUrlCache();
      toast.success("All sarees, groups and photos were deleted.");
      setOpen(false);
      onCleared?.();
    } catch {
      toast.error("The data could not be cleared. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="surface flex flex-col gap-3 border-[#F2C9C5] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FBE6E4] text-[#B0453C]">
          <ShieldAlert className="h-[18px] w-[18px]" />
        </span>
        <div>
          <h2 className="font-heading text-[18px] text-[hsl(var(--plum))]">Clear all data</h2>
          <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
            Permanently deletes every saree, supplier group and photo. This cannot be undone, so
            export a backup first.
          </p>
        </div>
      </div>

      <p className="text-[12px] text-foreground/65">
        {counts ? `${counts.sarees} listings · ${counts.groups} groups` : "Loading counts…"}
      </p>

      <Button
        variant="outline"
        className="h-11 w-full rounded-full border-[#F2C9C5] text-[#B0453C] hover:bg-[#FBE6E4] hover:text-[#B0453C] sm:w-auto sm:self-start sm:px-5"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Clear all data
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="w-[calc(100vw-1.5rem)] rounded-2xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-[20px] text-[#B0453C]">
              Delete everything in Arunika?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-5">
              Every saree, every supplier group and every photo will be permanently deleted. The
              dashboard will return to its empty state and this cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 rounded-full" disabled={busy}>
              Keep my data
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                handleClear();
              }}
              className="h-11 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy ? "Deleting…" : "Yes, delete everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}