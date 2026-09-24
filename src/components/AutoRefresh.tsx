"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Ricarica i dati della pagina ogni tot secondi (finché il report è in lavorazione). */
export function AutoRefresh({ ogniSecondi = 5 }: { ogniSecondi?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), ogniSecondi * 1000);
    return () => clearInterval(t);
  }, [router, ogniSecondi]);
  return null;
}
