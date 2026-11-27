import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Images, PlusCircle, Search } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import SareeCard from "@/components/saree/SareeCard";
import SareeViewer from "@/components/saree/SareeViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAsyncData } from "@/hooks/useAsyncData";
import { SORT_OPTIONS, fetchGroups, fetchSarees } from "@/lib/data";

export const Route = createFileRoute("/_authed/groups")({
  head: () => ({ meta: [{ title: "Gallery — Arunika" }] }),
  component: GalleryPage,
});

const PAGE_SIZE = 48;

function GalleryPage() {
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [groupId, setGroupId] = useState("all");
  const [sort, setSort] = useState("newest");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setTerm(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, reload } = useAsyncData(async () => {
    const [rows, groups] = await Promise.all([
      fetchSarees({
        search: term,
        groupId,
        sort,
        limit: limit + 1,
      }),
      fetchGroups(),
    ]);

    return {
      sarees: rows.slice(0, limit),
      hasMore: rows.length > limit,
      groups,
    };
  }, [term, groupId, sort, limit]);

  const sarees = data?.sarees || [];
  const groups = data?.groups || [];
  const filtering = Boolean(term) || groupId !== "all";

  return (
    <div>
      <PageHeader
        title="Gallery"
        description="Every saree you have saved, with its photo, prices and supplier group."
        action={
          <Button
            asChild
            className="h-11 rounded-full bg-primary px-4 text-primary-foreground"
          >
            <Link to="/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add sarees
            </Link>
          </Button>
        }
      />

      <div className="surface mb-4 flex flex-col gap-2.5 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setLimit(PAGE_SIZE);
            }}
            placeholder="Search by Item ID"
            className="h-11 border-border pl-9 text-[16px] sm:text-[14px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:flex">
          <Select
            value={groupId}
            onValueChange={(value) => {
              setGroupId(value);
              setLimit(PAGE_SIZE);
            }}
          >
            <SelectTrigger className="h-11 w-full border-border text-[15px] sm:w-[170px] sm:text-[14px]">
              <SelectValue placeholder="All groups" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All groups</SelectItem>

              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}

              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-11 w-full border-border text-[15px] sm:w-[190px] sm:text-[14px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <p className="mb-3 rounded-xl border border-[#F2C9C5] bg-[#FBE6E4] px-3 py-2 text-[12px] text-[#B0453C]">
          Your sarees could not be loaded. Please refresh the page and try again.
        </p>
      ) : null}

      {loading && !sarees.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5].map((slot) => (
            <div
              key={slot}
              className="h-64 animate-pulse rounded-2xl border border-border bg-secondary/50"
            />
          ))}
        </div>
      ) : sarees.length ? (
        <>
          <p className="mb-3 text-[12px] text-muted-foreground">
            {sarees.length} {sarees.length === 1 ? "saree" : "sarees"} shown
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {sarees.map((saree) => (
              <SareeCard
                key={saree.id}
                saree={saree}
                onOpen={setDetail}
              />
            ))}
          </div>

          {data?.hasMore ? (
            <div className="mt-5 flex justify-center">
              <Button
                variant="outline"
                className="h-11 rounded-full border-border px-6 text-[hsl(var(--plum))]"
                onClick={() => setLimit((value) => value + PAGE_SIZE)}
              >
                Load more
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          icon={Images}
          title={filtering ? "No sarees match this search" : "No sarees yet"}
          description={
            filtering
              ? "Try a different Item ID or choose another supplier group."
              : "Add your first saree with a photo, Item ID, selling price and purchase price."
          }
          action={
            filtering ? (
              <Button
                variant="outline"
                className="h-11 rounded-full border-border"
                onClick={() => {
                  setSearch("");
                  setGroupId("all");
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button
                asChild
                className="h-11 rounded-full bg-primary px-5 text-primary-foreground"
              >
                <Link to="/add">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add sarees
                </Link>
              </Button>
            )
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