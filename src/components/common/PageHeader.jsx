import { cn } from "@/lib/utils";

export default function PageHeader({ title, description, action, className }) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        <h1 className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] leading-tight text-[hsl(var(--plum))]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-[13px] leading-5 text-muted-foreground sm:text-[14px]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}