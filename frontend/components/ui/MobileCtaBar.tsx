"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { ArrowRight } from "lucide-react"

/**
 * MobileCtaBar — barra CTA fija en la parte inferior en dispositivos móviles.
 * Se oculta automáticamente en la página de contacto (ya tiene CTA visible)
 * y en las páginas de admin/login.
 */
export function MobileCtaBar() {
  const pathname = usePathname()

  const hidden =
    pathname === "/contacto" ||
    pathname === "/encuestas" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login")

  useEffect(() => {
    document.body.classList.toggle("mobile-cta-offset", !hidden)

    return () => {
      document.body.classList.remove("mobile-cta-offset")
    }
  }, [hidden])

  if (hidden) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="border-t border-[#3a2a20] bg-[#120c08]/95 px-5 py-3 backdrop-blur-md">
        <Link
          id="mobile-cta-bar-btn"
          href="/contacto"
          className="flex w-full items-center justify-center gap-2 bg-white py-3.5 text-xs font-bold uppercase tracking-widest text-[#271310] transition-all active:scale-[0.98]"
        >
          Contactar a ACARO
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
