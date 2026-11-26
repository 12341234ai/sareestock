import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PhotoPicker({ onFiles, busy = false, label = "Add saree photos" }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length) onFiles(files);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={cn(
        "rounded-2xl border-2 border-dashed border-border bg-card px-5 py-8 text-center transition-colors",
        dragging ? "border-primary bg-secondary" : "",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
      </div>
      <p className="mt-3 font-heading text-[17px] text-[hsl(var(--plum))]">{label}</p>
      <p className="mx-auto mt-1 max-w-sm text-[12px] leading-5 text-muted-foreground">
        Choose one or many photos. Each photo gets its own Item ID, prices and supplier group.
        Photos are compressed before saving.
      </p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <ImagePlus className="h-4 w-4" />
        Choose photos
      </button>
    </div>
  );
}