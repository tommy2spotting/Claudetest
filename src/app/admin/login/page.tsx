import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { Semaforo } from "@/components/Semaforo";

export const metadata: Metadata = { title: "Accesso al pannello" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <Semaforo acceso="wait" size={14} />
      <h1 className="text-[34px] font-extrabold">Pannello Vistochiaro</h1>
      <LoginForm />
    </main>
  );
}
