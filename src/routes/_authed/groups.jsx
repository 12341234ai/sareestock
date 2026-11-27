
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FolderOpen, PlusCircle } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import GroupCard from "@/components/groups/GroupCard";
import GroupFormDialog from "@/components/groups/GroupFormDialog";
import { Button } from "@/components/ui/button";
import { useAsyncData } from "@/hooks/useAsyncData";
import {
  deleteGroup,
  fetchGroupCounts,
  fetchGroups,
  unassignGroup,
} from "@/lib/data";

export const Route = createFileRoute("/_authed/groups")({
  head: () => ({ meta: [{ title: "Groups — Arunika" }] }),
  component: GroupsPage,
});

function GroupsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const { data, loading, error, reload } = useAsyncData(async () => {
    const [groups, counts] = await Promise.all([
      fetchGroups(),
      fetchGroupCounts(),
    ]);

    return { groups, counts };
  }, []);

  const groups = data?.groups || [];
  const counts = data?.counts || {};

  function openNewGroup() {
    setEditingGroup(null);
    setDialogOpen(true);
  }

  function openEditGroup(group) {
    setEditingGroup(group);
    setDialogOpen(true);
  }

  async function handleDelete(group) {
    const confirmed = window.confirm(
      `Delete "${group.name}"?\n\nThe sarees in this group will be kept. They will become unassigned.`
    );

    if (!confirmed) return;

    setDeletingId(group.id);
    setActionError("");

    try {
      await unassignGroup(group.id);
      await deleteGroup(group.id);
      await reload();
    } catch (err) {
      setActionError(
        err?.message || "This group could not be deleted. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Groups"
        description="Organise your sarees by supplier, collection or any category you choose."
        action={
          <Button
            onClick={openNewGroup}
            className="h-11 rounded-full bg-primary px-4 text-primary-foreground"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New group
          </Button>
        }
      />

      {error ? (
        <p className="mb-4 rounded-xl border border-[#F2C9C5] bg-[#FBE6E4] px-3 py-2 text-[12px] text-[#B0453C]">
          Your groups could not be loaded. Please refresh the page and try
          again.
        </p>
      ) : null}

      {actionError ? (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-[#F2C9C5] bg-[#FBE6E4] px-3 py-2 text-[12px] text-[#B0453C]"
        >
          {actionError}
        </p>
      ) : null}

      {loading && !data ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((slot) => (
            <div
              key={slot}
              className="h-36 animate-pulse rounded-2xl border border-border bg-secondary/50"
            />
          ))}
        </div>
      ) : groups.length > 0 ? (
        <>
          <p className="mb-3 text-[12px] text-muted-foreground">
            {groups.length} {groups.length === 1 ? "group" : "groups"}
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className={deletingId === group.id ? "opacity-50" : ""}
              >
                <GroupCard
                  group={group}
                  count={counts[group.id] || 0}
                  onEdit={openEditGroup}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No supplier groups yet"
          description="Create your first group to organise sarees by supplier or collection. For example, Silk Saree Suppliers."
          action={
            <Button
              onClick={openNewGroup}
              className="h-11 rounded-full bg-primary px-5 text-primary-foreground"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create your first group
            </Button>
          }
        />
      )}

      <GroupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editingGroup}
        groups={groups}
        onSaved={reload}
      />
    </div>
  );
}
