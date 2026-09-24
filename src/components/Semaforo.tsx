import type { CSSProperties } from "react";

export type Luce = "stop" | "wait" | "go";

const ORDINE: Luce[] = ["stop", "wait", "go"];

type Props = {
  acceso: Luce | null;
  /** Diametro di ogni luce in px. */
  size?: number;
  /** Anima l'accensione rosso → giallo → verde al caricamento. */
  intro?: boolean;
  className?: string;
  label?: string;
};

export function Semaforo({ acceso, size = 14, intro = false, className = "", label }: Props) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-flex w-fit shrink-0 items-center rounded-full bg-[#15171a] dark:bg-[#0b0c0d] ${intro ? "semaforo-intro" : ""} ${className}`}
      style={{ gap: size * 0.45, padding: `${size * 0.45}px ${size * 0.6}px` }}
    >
      {ORDINE.map((l) => {
        const on = l === acceso;
        const style = {
          width: size,
          height: size,
          "--c": `var(--${l})`,
          "--c-soft": `color-mix(in srgb, var(--${l}) 30%, transparent)`,
          background: on ? `var(--${l})` : "#3d4145",
          boxShadow: on ? `0 0 ${size * 0.6}px color-mix(in srgb, var(--${l}) 70%, transparent)` : undefined,
        } as CSSProperties;
        return <i key={l} data-acceso={on || undefined} className="block rounded-full" style={style} />;
      })}
    </span>
  );
}
