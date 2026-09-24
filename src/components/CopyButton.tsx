"use client";

import { useState } from "react";

export function CopyButton({ testo, label, className = "" }: { testo: string; label: string; className?: string }) {
  const [copiato, setCopiato] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(testo);
          setCopiato(true);
          setTimeout(() => setCopiato(false), 2500);
        } catch {
          window.prompt("Copia il testo:", testo);
        }
      }}
    >
      {copiato ? "Copiato ✓" : label}
    </button>
  );
}
