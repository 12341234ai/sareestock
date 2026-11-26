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
import SareeImage from "./SareeImage";
import { formatDate, formatINR } from "@/lib/sareeUtils";

export default function DeleteSareeDialog({ saree, open, onOpenChange, onConfirm, busy = false }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-[20px] text-[hsl(var(--plum))]">
            Delete this saree?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] leading-5">
            This listing and its photo will be removed. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {saree ? (
          <div className="flex gap-3 rounded-xl border border-border bg-background/60 p-3">
            <SareeImage
              fileUri={saree.photo_uri}
              alt={`Saree ${saree.item_id}`}
              className="h-24 w-[72px] shrink-0 rounded-lg"
            />
            <div className="min-w-0 space-y-1 text-[12px] text-foreground/75">
              <p className="text-[14px] font-semibold text-[hsl(var(--plum))]">{saree.item_id}</p>
              <p>Selling {formatINR(saree.selling_price)}</p>
              <p>Purchase {formatINR(saree.purchase_price)}</p>
              <p className="truncate">{saree.group_name || "Unassigned"}</p>
              <p className="text-muted-foreground">Added {formatDate(saree.upload_date)}</p>
            </div>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel className="h-11 rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="h-11 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? "Deleting…" : "Delete listing"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}