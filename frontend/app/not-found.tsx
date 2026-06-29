import Link from "next/link"
import { PublicLayout } from "@/components/layout/PublicLayout"

export default function NotFound() {
  return (
    <PublicLayout className="landing-typography">
      <main className="flex flex-grow flex-col items-center justify-center bg-[#faf9f5] px-5 py-32 text-center sm:px-8">
        <span className="block font-black text-[120px] leading-none tracking-[-0.04em] text-[#271310]/8 sm:text-[160px]">
          404
        </span>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[#271310] sm:text-4xl">
          Página no encontrada
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-[#504442]">
          La página que buscas no existe o fue movida. Puedes volver al inicio o explorar el sitio desde la navegación.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-block bg-[#271310] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#120c08]"
          >
            Volver al inicio
          </Link>
          <Link
            href="/contacto"
            className="inline-block border border-[#271310] px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#271310] transition-colors hover:bg-[#271310] hover:text-white"
          >
            Contacto
          </Link>
        </div>
      </main>
    </PublicLayout>
  )
}
