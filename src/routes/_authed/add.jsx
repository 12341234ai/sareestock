
import { useCallback, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, FolderPlus, Save } from "lucide-react";
import { toast } from "sonner";

import PageHeader from "@/components/common/PageHeader";
import ListingCard from "@/components/add/ListingCard";
import PhotoPicker from "@/components/add/PhotoPicker";
import { Button } from "@/components/ui/button";
import { useAsyncData } from "@/hooks/useAsyncData";

import {
  createSaree,
  fetchGroups,
  findDuplicates,
  reserveNextItemNumbers,
} from "@/lib/data";

import {
  blobToDataUrl,
  compressImage,
  computeSignature,
} from "@/lib/imageUtils";

import { parsePrice } from "@/lib/sareeUtils";

export const Route = createFileRoute("/_authed/add")({
  head: () => ({
    meta: [{ title: "Add Sarees — Arunika" }],
  }),
  component: AddSareesPage,
});

function AddSareesPage() {
  const { data: groups, loading: groupsLoading } = useAsyncData(
    fetchGroups,
    []
  );

  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const dupRef = useRef({});
  const moreInputRef = useRef(null);

  const groupList = groups || [];

  const updateItem = useCallback((key, patch) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, ...patch }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => {
      const target = prev.find((item) => item.key === key);

      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      delete dupRef.current[key];

      return prev.filter((item) => item.key !== key);
    });
  }, []);

  const handleFiles = async (files) => {
    const fileList = Array.from(files || []);

    if (!fileList.length) return;

    let suggestedIds;

    try {
      suggestedIds = await reserveNextItemNumbers(fileList.length);
    } catch (error) {
      toast.error("Could not generate Item IDs. Please try again.");
      return;
    }

    for (let index = 0; index < fileList.length; index++) {
      const file = fileList[index];
      const suggestedItemId = suggestedIds[index];

      const key = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;

      const previewUrl = URL.createObjectURL(file);

      setItems((prev) => [
        ...prev,
        {
          key,
          previewUrl,
          blob: null,
          signature: null,
          item_id: suggestedItemId,
          selling_price: "",
          purchase_price: "",
          group_id: "",
          dupConfirmed: false,
          compressing: true,
          status: "idle",
          error: "",
        },
      ]);

      try {
        const { blob } = await compressImage(file);
        const signature = await computeSignature(blob);

        setItems((prev) =>
          prev.map((item) =>
            item.key === key
              ? {
                  ...item,
                  blob,
                  signature,
                  compressing: false,
                }
              : item
          )
        );
      } catch (error) {
        setItems((prev) =>
          prev.map((item) =>
            item.key === key
              ? {
                  ...item,
                  compressing: false,
                  status: "error",
                  error:
                    error.message ||
                    "This photo could not be prepared.",
                }
              : item
          )
        );
      }
    }
  };

  const validateItem = (item) => {
    if (!item.blob) {
      return "This photo is still being prepared.";
    }

    if (!item.item_id.trim()) {
      return "Please enter an Item ID.";
    }

    const selling = parsePrice(item.selling_price);
    const purchase = parsePrice(item.purchase_price);

    if (!Number.isFinite(selling) || selling <= 0) {
      return "Please enter a valid selling price.";
    }

    if (!Number.isFinite(purchase) || purchase <= 0) {
      return "Please enter a valid purchase price.";
    }

    if (!item.group_id) {
      return "Please choose a supplier group.";
    }

    const dup = dupRef.current[item.key];

    if (dup?.matches?.length && !item.dupConfirmed) {
      return "This Item ID already exists. Check the existing saree, then confirm or change the ID.";
    }

    return "";
  };

  const handleSaveAll = async () => {
    const pending = items.filter(
      (item) => item.status !== "saved"
    );

    if (!pending.length) return;

    let hasErrors = false;
    const checked = [];

    for (const item of pending) {
      let error = validateItem(item);

      if (!error && !item.dupConfirmed) {
        try {
          const matches = await findDuplicates(item.item_id);

          if (matches.length) {
            error =
              "This Item ID already exists. Check the existing saree, then confirm or change the ID.";
          }
        } catch {
          // The debounced duplicate check already covers most cases.
        }
      }

      if (error) hasErrors = true;

      checked.push({ ...item, error });
    }

    setItems((prev) =>
      prev.map((item) => {
        const match = checked.find(
          (entry) => entry.key === item.key
        );

        return match
          ? { ...item, error: match.error }
          : item;
      })
    );

    if (hasErrors) {
      toast.error(
        "Please complete the highlighted sarees before saving."
      );
      return;
    }

    setSaving(true);

    let saved = 0;

    for (const item of checked) {
      setItems((prev) =>
        prev.map((entry) =>
          entry.key === item.key
            ? { ...entry, status: "uploading", error: "" }
            : entry
        )
      );

      try {
        const group = groupList.find(
          (entry) => entry.id === item.group_id
        );

        const uploadDate = new Date().toISOString();
        const photoData = await blobToDataUrl(item.blob);

        await createSaree({
          item_id: item.item_id.trim(),
          selling_price: parsePrice(item.selling_price),
          purchase_price: parsePrice(item.purchase_price),
          group_id: group?.id || "",
          group_name: group?.name || "",
          photo_uri: photoData,
          upload_date: uploadDate,
          signature: item.signature || null,
        });

        saved += 1;

        setItems((prev) =>
          prev.map((entry) =>
            entry.key === item.key
              ? { ...entry, status: "saved" }
              : entry
          )
        );
      } catch {
        setItems((prev) =>
          prev.map((entry) =>
            entry.key === item.key
              ? {
                  ...entry,
                  status: "error",
                  error:
                    "This saree could not be saved. Please try again.",
                }
              : entry
          )
        );
      }
    }

    setSaving(false);

    if (saved) {
      setSavedCount((count) => count + saved);

      toast.success(
        `${saved} ${saved === 1 ? "saree" : "sarees"} saved.`
      );
    } else {
      toast.error(
        "Nothing could be saved. Please try again."
      );
    }
  };

  const resetList = () => {
    items.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });

    dupRef.current = {};
    setItems([]);
    setSavedCount(0);
  };

  const pendingItems = items.filter(
    (item) => item.status !== "saved"
  );

  const noGroups = !groupsLoading && groupList.length === 0;

  return (
    <div>
      <PageHeader
        title="Add Sarees"
        description="Upload one or many photos. Every photo keeps its own Item ID, prices and supplier group."
      />

      {savedCount > 0 ? (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#C9E3D3] bg-[#F0F8F3] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-[13px] font-medium text-[#2F7A55]">
            <CheckCircle2 className="h-4 w-4" />
            {savedCount}{" "}
            {savedCount === 1 ? "saree" : "sarees"} saved to your catalogue.
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-full border-[#C9E3D3] bg-white text-[13px] text-[#2F7A55]"
              onClick={resetList}
            >
              Start a new upload
            </Button>

            <Button
              asChild
              className="h-10 rounded-full bg-primary px-4 text-[13px] text-primary-foreground"
            >
              <Link to="/gallery">View gallery</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {noGroups ? (
        <div className="surface flex flex-col items-start gap-3 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
            <FolderPlus className="h-5 w-5" />
          </span>

          <div>
            <h2 className="font-heading text-[19px] text-[hsl(var(--plum))]">
              Create a supplier group first
            </h2>

            <p className="mt-1 max-w-lg text-[13px] leading-5 text-muted-foreground">
              Every saree belongs to a supplier group, such as Silk Saree Suppliers or Wholesale Collection. Create one now, then come back to upload your sarees.
            </p>
          </div>

          <Button
            asChild
            className="h-11 rounded-full bg-primary px-5 text-primary-foreground"
          >
            <Link to="/groups">Go to Groups</Link>
          </Button>
        </div>
      ) : (
        <>
          <PhotoPicker onFiles={handleFiles} />

          {items.length ? (
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-[19px] text-[hsl(var(--plum))]">
                  {items.length}{" "}
                  {items.length === 1 ? "photo" : "photos"} ready
                </h2>

                <p className="text-[12px] text-muted-foreground">
                  {pendingItems.length} still to save
                </p>
              </div>

              {items.map((item, index) => (
                <ListingCard
                  key={item.key}
                  item={item}
                  index={index}
                  groups={groupList}
                  onChange={(patch) =>
                    updateItem(item.key, patch)
                  }
                  onRemove={() => removeItem(item.key)}
                  onDuplicateChange={(state) => {
                    dupRef.current[item.key] = state;
                  }}
                />
              ))}

              <div className="sticky bottom-20 z-20 lg:bottom-4">
                <div className="surface flex items-center justify-between gap-3 p-3">
                  <input
                    ref={moreInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const files = Array.from(
                        event.target.files || []
                      );

                      event.target.value = "";

                      if (files.length) {
                        handleFiles(files);
                      }
                    }}
                  />

                  <p className="hidden text-[12px] text-muted-foreground sm:block">
                    Your saree photos stay saved until you manually delete them.
                  </p>

                  <div className="flex w-full gap-2 sm:w-auto">
                    <Button
                      variant="outline"
                      className="h-11 flex-1 rounded-full border-border sm:flex-none"
                      onClick={() => moreInputRef.current?.click()}
                      disabled={saving}
                    >
                      Add more photos
                    </Button>

                    <Button
                      className="h-11 flex-1 rounded-full bg-primary px-5 text-primary-foreground sm:flex-none"
                      onClick={handleSaveAll}
                      disabled={saving || !pendingItems.length}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Saving…" : "Save all"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-center text-[12px] leading-5 text-muted-foreground">
              Photos are compressed in your browser before they are saved.
            </p>
          )}
        </>
      )}
    </div>
  );
}
