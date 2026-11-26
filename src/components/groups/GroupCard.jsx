import { Link } from "@tanstack/react-router";
import { FolderOpen, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GroupCard({ group, count, onEdit, onDelete }) {
  return (
    <div className="surface flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
            <FolderOpen className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading text-[17px] text-[hsl(var(--plum))]">{group.name}</p>
            <p className="text-[12px] text-muted-foreground">
              {count === 1 ? "1 listing" : `${count || 0} listings`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          className="h-10 flex-1 rounded-full border-border text-[13px] text-[hsl(var(--plum))]"
        >
          <Link to="/groups/$groupId" params={{ groupId: group.id }}>
            View sarees
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Rename ${group.name}`}
          className="h-10 w-10 rounded-full text-foreground/60 hover:bg-secondary"
          onClick={() => onEdit(group)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${group.name}`}
          className="h-10 w-10 rounded-full text-[#B0453C] hover:bg-[#FBE6E4]"
          onClick={() => onDelete(group)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}