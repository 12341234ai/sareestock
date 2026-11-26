import { Clock } from "lucide-react";
import { expiryMeta } from "@/lib/sareeUtils";
import { cn } from "@/lib/utils";

const TONES = {
  calm: "bg-white/90 text-foreground/70 border-border",
  soon: "bg-[#FDF3E1] text-[#B4741A] border-[#F3DDB4]",
  urgent: "bg-[#FBE6E4] text-[#B0453C] border-[#F2C9C5]",
  expired: "bg-[#FBE6E4] text-[#B0453C] border-[#F2C9C5]",
};

export default function ExpiryBadge({ expiryDate, compact = false, className }) {
  const meta = expiryMeta(expiryDate);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        TONES[meta.tone] || TONES.calm,
        compact ? "shadow-sm" : "",
        className,
      )}
    >
      <Clock className="h-3 w-3" />
      {meta.label}
    </span>
  );
}