"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  slug: string;
  maxImmagini: number;
  endpoint: string;
  submitLabel: string;
  /** Se presente il form si compila ma non parte: mostra questo messaggio. */
  chiuso?: string;
};

type Anteprima = { file: File; url: string };

const LATO_MAX = 1568; // oltre questa misura Claude riduce comunque l'immagine

/** Riduce e comprime lo screenshot nel browser: upload più veloce e meno token. */
async function comprimi(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scala = Math.min(1, LATO_MAX / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scala);
    const h = Math.round(bmp.height * scala);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.82));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // HEIC o formati non leggibili: ci pensa il server a rifiutarli con un messaggio
  }
}

export function ToolForm({ slug, maxImmagini, endpoint, submitLabel, chiuso }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [foto, setFoto] = useState<Anteprima[]>([]);
  const [errori, setErrori] = useState<string[]>([]);
  const [avviso, setAvviso] = useState<string | null>(null);
  const [invio, setInvio] = useState(false);
  const [trascina, setTrascina] = useState(false);
  const ids = useId();

  async function aggiungi(files: FileList | File[]) {
    const lista = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const spazio = maxImmagini - foto.length;
    if (lista.length > spazio) setErrori([`Puoi caricare al massimo ${maxImmagini} screenshot.`]);
    else setErrori([]);
    const compressi = await Promise.all(lista.slice(0, Math.max(0, spazio)).map(comprimi));
    setFoto((f) => [...f, ...compressi.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  }

  function togli(i: number) {
    setFoto((f) => {
      URL.revokeObjectURL(f[i].url);
      return f.filter((_, j) => j !== i);
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrori([]);
    const fd = new FormData(e.currentTarget);
    fd.delete("immagini");
    foto.forEach((f) => fd.append("immagini", f.file));
    if (foto.length === 0 && !String(fd.get("testo") ?? "").trim()) {
      setErrori(["Carica almeno uno screenshot o incolla il testo dell'annuncio."]);
      return;
    }
    if (chiuso) {
      setAvviso(chiuso);
      return;
    }
    setInvio(true);
    try {
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { url?: string; errori?: string[] };
      if (!res.ok || !data.url) {
        setErrori(data.errori ?? ["Qualcosa è andato storto. Riprova tra poco."]);
        setInvio(false);
        return;
      }
      router.push(data.url);
    } catch {
      setErrori(["Connessione assente o lenta. Controlla la rete e riprova."]);
      setInvio(false);
    }
  }

  const campo = "w-full rounded-xl border border-line bg-card px-4 py-3 text-[17px] outline-none focus:border-ink";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="slug" value={slug} />

      <div className="flex flex-col gap-2">
        <label htmlFor={`${ids}-img`} className="font-display text-[19px] font-bold">
          Screenshot dell&apos;annuncio
        </label>
        <p className="text-[15px] text-muted">
          Fino a {maxImmagini}: foto dell&apos;auto, prezzo, descrizione, dati tecnici. Copri pure nome e telefono del venditore.
        </p>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setTrascina(true);
          }}
          onDragLeave={() => setTrascina(false)}
          onDrop={(e) => {
            e.preventDefault();
            setTrascina(false);
            void aggiungi(e.dataTransfer.files);
          }}
          className={`grid grid-cols-3 gap-2 rounded-2xl border-2 border-dashed p-2 transition sm:grid-cols-4 ${trascina ? "border-ink bg-soft" : "border-line bg-card"}`}
        >
          {foto.map((f, i) => (
            <div key={f.url} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={`Screenshot ${i + 1}`} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => togli(i)}
                aria-label={`Togli lo screenshot ${i + 1}`}
                className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-ink/80 text-paper"
              >
                ×
              </button>
            </div>
          ))}
          {foto.length < maxImmagini && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-xl bg-soft text-center text-[15px] font-bold hover:bg-line"
            >
              <span className="text-3xl leading-none">+</span>
              {foto.length === 0 ? "Aggiungi" : "Altro"}
              <span className="text-[13px] font-normal text-muted">
                {foto.length}/{maxImmagini}
              </span>
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          id={`${ids}-img`}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) void aggiungi(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${ids}-testo`} className="font-display text-[19px] font-bold">
          Testo dell&apos;annuncio <span className="font-sans text-[15px] font-normal text-muted">(se preferisci incollarlo)</span>
        </label>
        <textarea id={`${ids}-testo`} name="testo" rows={5} className={campo} placeholder="Incolla qui la descrizione dell'annuncio…" />
      </div>

      <details className="group rounded-2xl border border-line bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 font-bold [&::-webkit-details-marker]:hidden">
          Aggiungi dettagli per un verdetto più preciso
          <span className="text-muted transition group-open:rotate-45">+</span>
        </summary>
        <div className="grid gap-4 px-4 pb-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-[15px] font-bold">
            Il tuo budget (€)
            <input name="budget" inputMode="numeric" pattern="[0-9]*" className={campo} placeholder="es. 8000" />
          </label>
          <label className="flex flex-col gap-1.5 text-[15px] font-bold">
            Km che fai in un anno
            <input name="kmAnno" inputMode="numeric" pattern="[0-9]*" className={campo} placeholder="es. 12000" />
          </label>
          <label className="flex flex-col gap-1.5 text-[15px] font-bold">
            Uso prevalente
            <select name="uso" className={campo} defaultValue="">
              <option value="">Non so</option>
              <option value="citta">Città</option>
              <option value="misto">Misto</option>
              <option value="extraurbano">Extraurbano</option>
              <option value="autostrada">Autostrada</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-[15px] font-bold">
            Provincia
            <input name="provincia" className={campo} placeholder="es. Torino" autoComplete="address-level2" />
          </label>
          <label className="flex flex-col gap-1.5 text-[15px] font-bold sm:col-span-2">
            Link dell&apos;annuncio <span className="font-normal text-muted">(solo come riferimento)</span>
            <input name="link" type="url" inputMode="url" className={campo} placeholder="https://…" />
          </label>
        </div>
      </details>

      {errori.length > 0 && (
        <div role="alert" className="rounded-xl bg-stop-soft p-4 text-[16px] text-stop-ink">
          {errori.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}
      {avviso && (
        <div role="status" className="rounded-xl bg-wait-soft p-4 text-[16px] text-wait-ink">
          {avviso}
        </div>
      )}

      <button
        type="submit"
        disabled={invio}
        className="sticky bottom-3 z-10 rounded-2xl bg-ink px-5 py-4 font-display text-[19px] font-bold text-paper shadow-[0_12px_28px_-12px_rgba(0,0,0,0.5)] transition hover:opacity-90 disabled:opacity-60"
      >
        {invio ? "Invio in corso…" : submitLabel}
      </button>
    </form>
  );
}
