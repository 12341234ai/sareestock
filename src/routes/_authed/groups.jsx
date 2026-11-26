import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FolderOpen, PlusCircle, Search } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import GroupCard from "@/components/groups/GroupCard";
import GroupFormDialog from "@/components/groups/GroupFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useAsyncData } from "@/hooks/useAsyncData";
import { deleteGroup, fetchGroupCounts, fetchGroups, unassignGroup } from "@/lib/data";

export const Route = createFileRoute("/_authed/groups")({
  head: () => ({ meta: [{ title: "Supplier Groups — Arunika" }] }),
  component: GroupsPage,
});

function GroupsPage() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data, loading, reload } = useAsyncData(async () => {
    const [groups, counts] = await Promise.all([fetchGroups(), fetchGroupCounts()]);
    return { groups, counts };
  }, []);

  const groups = data?.groups || [];
  const counts = data?.counts || {};
  const term = search.trim().toLowerCase();
  const visible = term ? groups.filter((group) => group.name.toLowerCase().includes(term)) : groups;

  const handleDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await unassignGroup(deleting.id);
      await deleteGroup(deleting.id);
      toast.success(`"${deleting.name}" deleted. Its sarees are now unassigned.`);
      setDeleting(null);
      reload();
    } catch {
      toast.error("This group could not be deleted. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Supplier Groups"
        description="Organise suppliers and collections. Sarees stay safe when a group is removed."
        action={
          <Button
            className="h-11 rounded-full bg-primary px-4 text-primary-foreground"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New group
          </Button>
        }
      />

      <div className="surface mb-4 flex items-center gap-2 p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search groups"
            className="h-11 border-border pl-9 text-[16px] sm:text-[14px]"
          />
        </div>
      </div>

      {loading && !groups.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((slot) => (
            <div key={slot} className="h-32 animate-pulse rounded-2xl border border-border bg-secondary/50" />
          ))}
        </div>
      ) : visible.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              count={counts[group.id] || 0}
              onEdit={(target) => {
                setEditing(target);
                setFormOpen(true);
              }}
              onDelete={setDeleting}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title={term ? "No group matches this search" : "No supplier groups yet"}
          description={
            term
              ? "Try a different name."
              : "Create groups such as Silk Saree Suppliers, Wholesale Collection or Festival Collection."
          }
          action={
            term ? (
              <Button variant="outline" className="h-11 rounded-full border-border" onClick={() => setSearch("")}>
                Clear search
              </Button>
            ) : (
              <Button
                className="h-11 rounded-full bg-primary px-5 text-primary-foreground"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create your first group
              </Button>
            )
          }
        />
      )}

      <GroupFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        group={editing}
        groups={groups}
        onSaved={(name) => {
          toast.success(editing ? `Group renamed to "${name}".` : `Group "${name}" created.`);
          reload();
        }}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent className="w-[calc(100vw-1.5rem)] rounded-2xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-[20px] text-[hsl(var(--plum))]">
              Delete “{deleting?.name}”?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-5">
              The group will be removed. Its {counts[deleting?.id] || 0} saree
              {(counts[deleting?.id] || 0) === 1 ? "" : "s"} will not be deleted — they become
              unassigned and stay in your Gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              className="h-11 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy ? "Deleting…" : "Delete group"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}