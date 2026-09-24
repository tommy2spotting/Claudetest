import Link from "next/link";
import { Semaforo } from "./Semaforo";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 font-display text-[21px] font-bold tracking-tight">
      <Semaforo acceso="go" size={11} />
      Vistochiaro
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="px-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 py-4">
        <Logo />
        <nav className="flex items-center gap-5 text-[15px]">
          <Link href="/compra-o-scappa" className="hidden font-bold hover:underline sm:inline">
            Compra o Scappa
          </Link>
          <Link href="/esempio" className="text-muted hover:text-ink hover:underline">
            Report di esempio
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line px-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 py-10 text-[15px] text-muted">
        <Logo />
        <p className="max-w-[62ch]">
          I risultati sono generati con l&apos;intelligenza artificiale e controllati in modo automatico. Sono
          informazioni per aiutarti a decidere: non sostituiscono vedere l&apos;auto dal vivo né il parere di un
          professionista.
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/compra-o-scappa" className="hover:text-ink hover:underline">
            Compra o Scappa
          </Link>
          <Link href="/esempio" className="hover:text-ink hover:underline">
            Report di esempio
          </Link>
          <span>Privacy, termini e contatti: in preparazione</span>
        </nav>
        <p className="text-[13px]">© {new Date().getFullYear()} Vistochiaro</p>
      </div>
    </footer>
  );
}
