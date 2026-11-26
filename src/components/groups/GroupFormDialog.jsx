import { useEffect, useState } from "react";
import { saveGroup } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GroupFormDialog({ open, onOpenChange, group, groups, onSaved }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(group?.name || "");
      setError("");
      setSaving(false);
    }
  }, [open, group]);

  const handleSave = async () => {
    const clean = name.trim();
    if (!clean) {
      setError("Please give this group a name.");
      return;
    }
    const clash = groups.find(
      (g) => g.name.trim().toLowerCase() === clean.toLowerCase() && g.id !== group?.id,
    );
    if (clash) {
      setError(`"${clash.name}" already exists. Please use a different name.`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveGroup({ id: group?.id, name: clean });
      onOpenChange(false);
      onSaved?.(clean);
    } catch (err) {
      setError(err?.message || "This group could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-md rounded-2xl border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-[20px] text-[hsl(var(--plum))]">
            {group ? "Rename group" : "New supplier group"}
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            Groups keep suppliers and collections apart, for example Silk Saree Suppliers or Festival
            Collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="group-name" className="field-label">
            Group name
          </Label>
          <Input
            id="group-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSave();
            }}
            placeholder="Silk Saree Suppliers"
            className="h-11 border-border text-[16px] sm:text-[14px]"
            autoFocus
          />
          {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="h-11 rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="h-11 rounded-full bg-primary px-5 text-primary-foreground"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : group ? "Save name" : "Create group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}