import { Eye, Trash2 } from "lucide-react";
import SareeImage from "@/components/saree/SareeImage";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/sareeUtils";
import { cn } from "@/lib/utils";

function badgeFor(matchType, similarity) {
  if (matchType === "id_exact") {
    return { label: "100% ID MATCH", className: "bg-primary text-primary-foreground" };
  }
  if (matchType === "id_partial") {
    return { label: "Item ID match", className: "bg-secondary text-[hsl(var(--plum))]" };
  }
  return { label: `≈ ${similarity}% similar`, className: "bg-[#FDF3E1] text-[#8A5A12]" };
}

export default function SearchResultRow({ result, onView, onDelete }) {
  const { saree, similarity, matchType } = result;
  const badge = badgeFor(matchType, similarity);

  return (
    <div className="surface flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <SareeImage
          fileUri={saree.photo_uri}
          alt={`Saree ${saree.item_id}`}
          className="h-24 w-[72px] shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-semibold text-[hsl(var(--plum))]">{saree.item_id}</p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                badge.className,
              )}
            >
              {badge.label}
            </span>
          </div>
          <p className="truncate text-[12px] text-foreground/65">
            {saree.group_name || "Unassigned"}
          </p>
          <p className="text-[12px] text-foreground/75">
            Selling {formatINR(saree.selling_price)} · Purchase {formatINR(saree.purchase_price)}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="h-10 flex-1 rounded-full border-border text-[13px] text-[hsl(var(--plum))] sm:flex-none"
          onClick={() => onView(saree)}
        >
          <Eye className="mr-1.5 h-4 w-4" />
          View details
        </Button>
        <Button
          variant="ghost"
          className="h-10 flex-1 rounded-full text-[13px] text-[#B0453C] hover:bg-[#FBE6E4] sm:flex-none"
          onClick={() => onDelete(saree)}
        >
          <Trash2 className="mr-1.5 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}