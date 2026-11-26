import { useState } from "react";
import { toast } from "sonner";
import DeleteSareeDialog from "./DeleteSareeDialog";
import SareeDetailDialog from "./SareeDetailDialog";
import { deleteSaree } from "@/lib/data";

export default function SareeViewer({
  detail,
  onDetailChange,
  deleteTarget,
  onDeleteTargetChange,
  onDeleted,
}) {
  const [busy, setBusy] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteSaree(deleteTarget.id);
      toast.success(`Saree ${deleteTarget.item_id} deleted.`);
      onDeleteTargetChange(null);
      onDetailChange(null);
      onDeleted?.();
    } catch {
      toast.error("This saree could not be deleted. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SareeDetailDialog
        saree={detail}
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) onDetailChange(null);
        }}
        onDelete={(saree) => onDeleteTargetChange(saree)}
      />
      <DeleteSareeDialog
        saree={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) onDeleteTargetChange(null);
        }}
        onConfirm={confirmDelete}
        busy={busy}
      />
    </>
  );
}