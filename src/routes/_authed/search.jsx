import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Loader2, ScanSearch, Search, X } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SareeViewer from "@/components/saree/SareeViewer";
import SearchResultRow from "@/components/search/SearchResultRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchAllSarees } from "@/lib/data";
import { compressImage, computeSignature, signatureSimilarity } from "@/lib/imageUtils";

export const Route = createFileRoute("/_authed/search")({
  head: () => ({ meta: [{ title: "Photo Search — Arunika" }] }),
  component: PhotoSearchPage,
});

const MATCH_THRESHOLD = 25;

function PhotoSearchPage() {
  const [itemId, setItemId] = useState("");
  const [refPreview, setRefPreview] = useState(null);
  const [refSignature, setRefSignature] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileRef = useRef(null);

  const handleRefFile = async (file) => {
    if (!file) return;
    setError("");
    setPreparing(true);
    try {
      const { blob } = await compressImage(file);
      const signature = await computeSignature(blob);
      if (refPreview) URL.revokeObjectURL(refPreview);
      setRefPreview(URL.createObjectURL(blob));
      setRefSignature(signature);
    } catch (err) {
      setError(err.message || "This photo could not be read.");
    } finally {
      setPreparing(false);
    }
  };

  const clearReference = () => {
    if (refPreview) URL.revokeObjectURL(refPreview);
    setRefPreview(null);
    setRefSignature(null);
  };

  const runSearch = async () => {
    const term = itemId.trim();
    if (!term && !refSignature) {
      setError("Enter an Item ID, choose a reference photo, or use both.");
      return;
    }
    setSearching(true);
    setError("");
    try {
      const all = await fetchAllSarees(500);
      const lower = term.toLowerCase();
      const found = [];

      for (const saree of all) {
        const sareeId = String(saree.item_id || "").toLowerCase();
        const idExact = Boolean(lower) && sareeId === lower;
        const idPartial = Boolean(lower) && sareeId.includes(lower);

        if (refSignature) {
          if (lower && !idPartial) continue;
          const similarity = idExact ? 100 : signatureSimilarity(refSignature, saree.signature);
          if (!idExact && similarity < MATCH_THRESHOLD) continue;
          found.push({
            saree,
            similarity,
            matchType: idExact ? "id_exact" : idPartial ? "photo_id" : "photo",
          });
        } else {
          if (!idPartial) continue;
          found.push({
            saree,
            similarity: idExact ? 100 : 0,
            matchType: idExact ? "id_exact" : "id_partial",
          });
        }
      }

      found.sort((a, b) => {
        if (b.similarity !== a.similarity) return b.similarity - a.similarity;
        return new Date(b.saree.upload_date) - new Date(a.saree.upload_date);
      });
      setResults(found);
    } catch {
      setError("The search could not be completed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const resetSearch = () => {
    setItemId("");
    clearReference();
    setResults(null);
    setError("");
  };

  return (
    <div>
      <PageHeader
        title="Photo Search"
        description="Find a saree by its Item ID, by a reference photo, or by both together."
      />

      <div className="surface space-y-4 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="search-item-id" className="field-label">
              Item ID
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-item-id"
                value={itemId}
                onChange={(event) => {
                  setItemId(event.target.value);
                  setError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") runSearch();
                }}
                placeholder="AR101"
                className="h-11 border-border pl-9 text-[16px] sm:text-[14px]"
              />
            </div>
            <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">
              Exact IDs show “100% ID MATCH”. Shorter text finds partial matches.
            </p>
          </div>

          <div>
            <Label className="field-label">Reference photo</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                handleRefFile(file);
              }}
            />
            {refPreview ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-2">
                <img
                  src={refPreview}
                  alt="Reference saree"
                  className="h-16 w-12 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-[hsl(var(--plum))]">
                    Reference ready
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Compared using colour and structure
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove reference photo"
                  className="h-9 w-9 rounded-full text-foreground/50"
                  onClick={clearReference}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/50 text-[13px] text-foreground/70 transition-colors hover:bg-secondary"
                disabled={preparing}
              >
                {preparing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Preparing photo…
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4" /> Choose a reference photo
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {error ? <p className="text-[12px] text-destructive">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button
            className="h-11 rounded-full bg-primary px-5 text-primary-foreground"
            onClick={runSearch}
            disabled={searching || preparing}
          >
            <ScanSearch className="mr-2 h-4 w-4" />
            {searching ? "Searching…" : "Search"}
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-full border-border"
            onClick={resetSearch}
            disabled={searching}
          >
            Clear
          </Button>
        </div>

        <p className="rounded-xl bg-secondary/60 px-3 py-2 text-[11px] leading-4 text-foreground/65">
          Photo matching runs inside this browser using colour histograms and image hashes. Similarity
          percentages are estimates, not proof that two sarees are the same. Lighting, angle, camera
          quality and the background can change the result.
        </p>
      </div>

      <div className="mt-5">
        {results === null ? (
          <EmptyState
            icon={ScanSearch}
            title="Search your catalogue"
            description="Type an Item ID, add a reference photo, or combine both to narrow the results."
          />
        ) : results.length ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[12px] text-muted-foreground">
                {results.length} {results.length === 1 ? "match" : "matches"}
              </p>
              <p className="text-[12px] text-muted-foreground">Best match first</p>
            </div>
            <div className="space-y-3">
              {results.map((result) => (
                <SearchResultRow
                  key={result.saree.id}
                  result={result}
                  onView={setDetail}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={ScanSearch}
            title="No matches found"
            description="Check the Item ID, or try a clearer reference photo of the saree."
            action={
              <Button variant="outline" className="h-11 rounded-full border-border" onClick={resetSearch}>
                Start a new search
              </Button>
            }
          />
        )}
      </div>

      <SareeViewer
        detail={detail}
        onDetailChange={setDetail}
        deleteTarget={deleteTarget}
        onDeleteTargetChange={setDeleteTarget}
        onDeleted={runSearch}
      />
    </div>
  );
}