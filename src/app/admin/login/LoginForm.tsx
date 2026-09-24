"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [errore, azione, inCorso] = useActionState(login, null);
  return (
    <form action={azione} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 font-bold">
        Password
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-xl border border-line bg-card px-4 py-3 text-[17px] font-normal outline-none focus:border-ink"
        />
      </label>
      {errore && (
        <p role="alert" className="rounded-xl bg-stop-soft px-4 py-3 text-stop-ink">
          {errore}
        </p>
      )}
      <button disabled={inCorso} className="rounded-xl bg-ink px-4 py-3.5 font-bold text-paper disabled:opacity-60">
        {inCorso ? "Controllo…" : "Entra nel pannello"}
      </button>
    </form>
  );
}
