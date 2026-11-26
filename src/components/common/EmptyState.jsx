import { cn } from "@/lib/utils";

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "surface flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
        {Icon ? <Icon className="h-6 w-6" /> : null}
      </div>
      <h3 className="font-heading text-[18px] text-[hsl(var(--plum))]">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-[13px] leading-5 text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}