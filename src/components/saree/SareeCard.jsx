import SareeImage from "./SareeImage";
import { formatDate, formatINR } from "@/lib/sareeUtils";

export default function SareeCard({ saree, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(saree)}
      className="surface group overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(59,27,41,0.10)]"
    >
      <div className="relative">
        <SareeImage
          fileUri={saree.photo_uri}
          alt={`Saree ${saree.item_id}`}
          className="aspect-[3/4] w-full"
          imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="space-y-1.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium tracking-wide text-[hsl(var(--plum))]">
            {saree.item_id}
          </span>

          <span className="shrink-0 text-[13px] font-semibold text-[hsl(var(--plum))]">
            {formatINR(saree.selling_price)}
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Bought at {formatINR(saree.purchase_price)}
        </p>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="truncate text-[11px] text-foreground/60">
            {saree.group_name || "Unassigned"}
          </span>

          <span className="shrink-0 text-[11px] text-muted-foreground">
            {formatDate(saree.upload_date)}
          </span>
        </div>
      </div>
    </button>
  );
}