import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FolderOpen } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import SareeCard from "@/components/saree/SareeCard";
import SareeViewer from "@/components/saree/SareeViewer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchGroups, fetchSarees } from "@/lib/data";

export const Route = createFileRoute("/_authed/groups/$groupId")({
  head: () => ({ meta: [{ title: "Group — Arunika" }] }),
  component: GroupDetailPage,
});

function GroupDetailPage() {
  const { groupId } = Route.useParams();
  const unassigned = groupId === "unassigned";

  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, loading, reload } = useAsyncData(async () => {
    const [sarees, groups] = await Promise.all([
      fetchSarees({
        groupId: unassigned ? "unassigned" : groupId,
        sort: "newest",
        limit: 200,
      }),
      fetchGroups(),
    ]);

    return {
      sarees,
      group: groups.find((group) => group.id === groupId) || null,
    };
  }, [groupId]);

  const sarees = data?.sarees || [];
  const title = unassigned
    ? "Unassigned sarees"
    : data?.group?.name || "Supplier group";

  return (
    <div>
      <Link
        to="/groups"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All groups
      </Link>

      <div className="mb-5">
        <h1 className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] leading-tight text-[hsl(var(--plum))]">
          {title}
        </h1>

        <p className="mt-1 text-[13px] text-muted-foreground">
          {loading
            ? "Loading sarees…"
            : `${sarees.length} ${
                sarees.length === 1 ? "listing" : "listings"
              }${
                unassigned
                  ? " without a supplier group"
                  : " in this group"
              }`}
        </p>
      </div>

      {sarees.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {sarees.map((saree) => (
            <SareeCard
              key={saree.id}
              saree={saree}
              onOpen={setDetail}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title={loading ? "Loading…" : "Nothing here yet"}
          description={
            unassigned
              ? "Sarees from a deleted group appear here until you assign them to a new group."
              : "Add sarees and choose this group on the Add Sarees page."
          }
          action={
            <Link
              to="/add"
              className="inline-flex min-h-[44px] items-center rounded-full bg-primary px-5 text-[14px] font-medium text-primary-foreground"
            >
              Add sarees
            </Link>
          }
        />
      )}

      <SareeViewer
        detail={detail}
        onDetailChange={setDetail}
        deleteTarget={deleteTarget}
        onDeleteTargetChange={setDeleteTarget}
        onDeleted={reload}
      />
    </div>
  );
}