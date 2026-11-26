import { useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { findDuplicates } from "@/lib/data";
import SareeImage from "@/components/saree/SareeImage";
import { formatDate, formatINR } from "@/lib/sareeUtils";
import { cn } from "@/lib/utils";

export default function ListingCard({
  item,
  index,
  groups,
  onChange,
  onRemove,
  onDuplicateChange,
}) {
  const [dup, setDup] = useState({ checking: false, matches: [] });
  const notified = useRef("");

  useEffect(() => {
    const value = item.item_id.trim();
    if (!value) {
      setDup({ checking: false, matches: [] });
      if (notified.current !== "") {
        notified.current = "";
        onDuplicateChange({ checking: false, matches: [] });
      }
      return undefined;
    }
    let alive = true;
    setDup({ checking: true, matches: [] });
    const timer = setTimeout(async () => {
      try {
        const matches = await findDuplicates(value);
        if (!alive) return;
        setDup({ checking: false, matches });
        notified.current = value;
        onDuplicateChange({ checking: false, matches });
      } catch {
        if (!alive) return;
        setDup({ checking: false, matches: [] });
        notified.current = value;
        onDuplicateChange({ checking: false, matches: [] });
      }
    }, 450);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.item_id, item.key]);

  const hasDuplicate = dup.matches.length > 0;
  const saved = item.status === "saved";
  const uploading = item.status === "uploading";
  const disabled = saved || uploading;

  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-background/50 px-4 py-2.5">
        <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          Saree {index + 1}
        </p>
        <div className="flex items-center gap-2">
          {saved ? (
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2F7A55]">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          ) : null}
          {!saved ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove this photo"
              className="h-8 w-8 rounded-full text-foreground/50 hover:bg-[#FBE6E4] hover:text-[#B0453C]"
              onClick={onRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-[132px_1fr]">
        <div className="relative mx-auto w-full max-w-[132px] sm:mx-0">
          <div className="overflow-hidden rounded-xl border border-border bg-secondary">
            {item.previewUrl ? (
              <img
                src={item.previewUrl}
                alt={`Saree ${index + 1} preview`}
                className="aspect-[3/4] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center text-muted-foreground">
                <ImagePlus className="h-5 w-5" />
              </div>
            )}
          </div>
          {item.compressing ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 text-[11px] text-[hsl(var(--plum))]">
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Compressing
            </div>
          ) : null}
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/75 text-[11px] text-[hsl(var(--plum))]">
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Saving
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor={`item-id-${item.key}`} className="field-label">
              Item ID
            </Label>
            <Input
              id={`item-id-${item.key}`}
              value={item.item_id}
              onChange={(event) =>
                onChange({ item_id: event.target.value, dupConfirmed: false, error: "" })
              }
              placeholder="AR101"
              className={cn(
                "h-11 border-border text-[16px] sm:text-[14px]",
                hasDuplicate && !item.dupConfirmed ? "border-[#E9B7A6] bg-[#FDF3E1]/40" : "",
              )}
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor={`selling-${item.key}`} className="field-label">
              Selling price (₹)
            </Label>
            <Input
              id={`selling-${item.key}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={item.selling_price}
              onChange={(event) => onChange({ selling_price: event.target.value, error: "" })}
              placeholder="2500"
              className="h-11 border-border text-[16px] sm:text-[14px]"
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor={`purchase-${item.key}`} className="field-label">
              Purchase price (₹)
            </Label>
            <Input
              id={`purchase-${item.key}`}
              type="number"
              inputMode="numeric"
              min="0"
              value={item.purchase_price}
              onChange={(event) => onChange({ purchase_price: event.target.value, error: "" })}
              placeholder="1800"
              className="h-11 border-border text-[16px] sm:text-[14px]"
              disabled={disabled}
            />
          </div>

          <div className="sm:col-span-2">
            <Label className="field-label">Supplier group</Label>
            <Select
              value={item.group_id || undefined}
              onValueChange={(value) => onChange({ group_id: value, error: "" })}
              disabled={disabled}
            >
              <SelectTrigger className="h-11 border-border text-[15px] sm:text-[14px]">
                <SelectValue placeholder="Choose a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {item.error ? (
            <p className="text-[12px] leading-5 text-destructive sm:col-span-2">{item.error}</p>
          ) : null}
        </div>
      </div>

      {hasDuplicate ? (
        <div className="border-t border-[#F3DDB4] bg-[#FDF3E1] px-4 py-3">
          <p className="text-[13px] font-medium text-[#8A5A12]">
            This Item ID already exists. Please check the existing saree details before continuing.
          </p>
          <div className="mt-3 space-y-2">
            {dup.matches.map((match) => (
              <div
                key={match.id}
                className="flex items-center gap-3 rounded-xl border border-[#F3DDB4] bg-white/80 p-2"
              >
                <SareeImage
                  fileUri={match.photo_uri}
                  alt={`Existing saree ${match.item_id}`}
                  className="h-16 w-12 shrink-0 rounded-lg"
                />
                <div className="min-w-0 text-[12px] text-foreground/75">
                  <p className="font-medium text-[hsl(var(--plum))]">{match.item_id}</p>
                  <p className="truncate">{match.group_name || "Unassigned"}</p>
                  <p>
                    Selling {formatINR(match.selling_price)} · Purchase{" "}
                    {formatINR(match.purchase_price)}
                  </p>
                  <p className="text-muted-foreground">Added {formatDate(match.upload_date)}</p>
                </div>
              </div>
            ))}
          </div>
          {item.dupConfirmed ? (
            <p className="mt-3 text-[12px] font-medium text-[#8A5A12]">
              Duplicate confirmed. This listing will be saved as a separate saree.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-full border-[#E9C79A] bg-white text-[13px] text-[#8A5A12]"
                onClick={() => onChange({ item_id: "", dupConfirmed: false })}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-10 rounded-full bg-[#B4741A] px-4 text-[13px] text-white hover:bg-[#9A6214]"
                onClick={() => onChange({ dupConfirmed: true })}
              >
                Continue anyway
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}