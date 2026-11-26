import { useEffect, useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { getSignedUrl } from "@/lib/signedUrls";
import { cn } from "@/lib/utils";

export default function SareeImage({ fileUri, alt = "Saree photo", className, imgClassName }) {
  const [url, setUrl] = useState(null);
  const [state, setState] = useState(fileUri ? "loading" : "empty");

  useEffect(() => {
    let alive = true;
    if (!fileUri) {
      setState("empty");
      setUrl(null);
      return undefined;
    }
    setState("loading");
    getSignedUrl(fileUri)
      .then((signed) => {
        if (!alive) return;
        setUrl(signed);
        setState("ready");
      })
      .catch(() => {
        if (alive) setState("error");
      });
    return () => {
      alive = false;
    };
  }, [fileUri]);

  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {state === "ready" && url ? (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      ) : null}
      {state === "loading" ? (
        <div className="flex h-full w-full items-center justify-center text-primary/60">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : null}
      {state === "empty" || state === "error" ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
          <ImageOff className="h-5 w-5" />
          <span className="text-[11px]">{state === "error" ? "Photo unavailable" : "No photo"}</span>
        </div>
      ) : null}
    </div>
  );
}