import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import SareeImage from "./SareeImage";
import { formatDate, formatINR } from "@/lib/sareeUtils";

function Row({ label, value, strong = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2 last:border-0">
      <span className="text-[12px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <span
        className={
          strong
            ? "text-[15px] font-semibold text-[hsl(var(--plum))]"
            : "text-[14px] text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

export default function SareeDetailDialog({ saree, open, onOpenChange, onDelete }) {
  if (!saree) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto rounded-2xl border-border p-0 sm:max-w-2xl">
        <SareeImage
          fileUri={saree.photo_uri}
          alt={`Saree ${saree.item_id}`}
          className="aspect-[4/5] w-full sm:aspect-[16/9]"
        />

        <div className="space-y-3 p-5">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="font-heading text-[22px] text-[hsl(var(--plum))]">
              {saree.item_id}
            </DialogTitle>
          </DialogHeader>

          <div className="rounded-xl border border-border bg-background/60 px-3">
            <Row label="Selling price" value={formatINR(saree.selling_price)} strong />
            <Row label="Purchase price" value={formatINR(saree.purchase_price)} />
            <Row label="Supplier group" value={saree.group_name || "Unassigned"} />
            <Row label="Date added" value={formatDate(saree.upload_date)} />
          </div>

          <p className="text-[12px] leading-5 text-muted-foreground">
            This saree and its photo will remain saved until you choose to delete the listing.
          </p>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="h-11 rounded-full border-border text-foreground/70"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>

            <Button
              variant="outline"
              className="h-11 rounded-full border-[#F2C9C5] text-[#B0453C] hover:bg-[#FBE6E4] hover:text-[#B0453C]"
              onClick={() => onDelete(saree)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete listing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}