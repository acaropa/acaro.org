"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Menu, X } from "lucide-react"

import { Logo } from "@/components/Logo"
import { SocialIcon, SocialNetwork, socialNetworks } from "@/components/SocialNetworks"
import { cn } from "@/lib/utils"

type NavItem = {
  href?: string
  label: string
  submenu?: { href: string; label: string; info?: string; social?: SocialNetwork }[]
}

const navItems: NavItem[] = [
  { href: "/", label: "Inicio" },
  {
    label: "Nosotros",
    submenu: [
      { href: "/nosotros", label: "Acerca de la Asociación", info: "Conoce nuestra historia, misión y propósito." },
      { href: "/noticias", label: "Noticias y Novedades", info: "Explora los últimos avances y eventos de la comunidad." },
    ],
  },
  {
    label: "Proyectos",
    submenu: [
      { href: "/proyectos", label: "Todos los proyectos", info: "Explora todas nuestras iniciativas." },
    ],
  },
  { href: "/biblioteca", label: "Biblioteca" },
  {
    label: "Redes",
    submenu: socialNetworks.map((network) => ({ ...network, social: network.id })),
  },
]

export function PublicNavbar() {
  const pathname = usePathname()
  const isHome = pathname === "/" || pathname === ""
  const hasTransparentHero = isHome || pathname === "/biblioteca" || pathname === "/biblioteca/" || pathname === "/nosotros" || pathname === "/nosotros/"
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isTransparent = hasTransparentHero && !isScrolled && !isMobileMenuOpen

  return (
    <header
      className={cn(
        "fixed top-4 left-0 right-0 z-50 mx-auto w-full max-w-6xl px-4 text-[#f8efe3] transition-all duration-300",
      )}
    >
      <div
        className={cn(
          "relative flex h-[64px] items-center justify-between rounded-full px-6 transition-all duration-300",
          isTransparent && !isMobileMenuOpen
            ? "border border-transparent bg-transparent"
            : "border border-[#3a2a20]/80 bg-[#120c08]/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        )}
      >
        <Link href="/" aria-label="Ir al inicio" className="transition-opacity hover:opacity-80">
          <Logo variant="white" className="[&_span]:text-[16px] [&_span]:leading-[0.95]" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) =>
            item.submenu ? (
              <div key={item.label} className="group relative">
                <button className="flex items-center gap-1.5 py-5 text-sm font-medium text-[#d8c9bb] transition-colors hover:text-[#d7a24a]">
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
                </button>
                <div className="invisible absolute left-1/2 top-[calc(100%-8px)] w-72 -translate-x-1/2 pt-2 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100">
                  <div className="overflow-hidden rounded-2xl border border-[#3a2a20]/80 bg-[#120c08]/90 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        target={sub.href.startsWith("http") ? "_blank" : undefined}
                        rel={sub.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="group/sub flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-[#2a1a12]/80"
                      >
                        {sub.social && (
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2a1a12] text-[#d7a24a] transition-colors group-hover/sub:bg-[#d7a24a] group-hover/sub:text-[#120c08]">
                            <SocialIcon network={sub.social} className="h-4 w-4" />
                          </span>
                        )}
                        <span className="flex flex-col">
                          <span className="text-sm font-semibold text-[#f8efe3] group-hover/sub:text-[#d7a24a]">{sub.label}</span>
                          {sub.info && <span className="mt-1 text-xs leading-snug text-[#b8a99a]">{sub.info}</span>}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={cn(
                    "relative py-6 text-sm font-medium transition-colors hover:text-[#d7a24a]",
                    pathname === item.href ? "text-[#d7a24a]" : "text-[#d8c9bb]"
                  )}
                >
                  {item.label}
                  {pathname === item.href && <span className="absolute inset-x-0 bottom-4 mx-auto h-px w-4 bg-[#d7a24a]" />}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#d7a24a] px-5 text-sm font-semibold text-[#120c08] transition-all hover:-translate-y-0.5 hover:bg-[#e8b661] active:translate-y-0">
              Acceso interno
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="flex h-11 w-11 items-center justify-center rounded-md border border-[#3a2a20] transition-colors hover:bg-[#2a1a12]"
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "absolute left-4 right-4 top-[80px] origin-top grid rounded-3xl border border-[#3a2a20]/80 bg-[#120c08]/95 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 md:hidden",
          isMobileMenuOpen ? "grid-rows-[1fr] opacity-100 scale-y-100" : "grid-rows-[0fr] opacity-0 scale-y-95 pointer-events-none"
        )}
      >
        <div className="overflow-hidden">
          <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
            {navItems.map((item) =>
              item.submenu ? (
                <div key={item.label} className="border-b border-[#3a2a20] py-3">
                  <p className="py-2 font-serif text-xl font-semibold">{item.label}</p>
                  <div className="border-l border-[#5a3424] pl-4">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        target={sub.href.startsWith("http") ? "_blank" : undefined}
                        rel={sub.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-2.5 text-sm text-[#d8c9bb] transition-colors hover:text-[#d7a24a]"
                      >
                        {sub.social && <SocialIcon network={sub.social} className="h-4 w-4" />}
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.href} href={item.href!} onClick={() => setIsMobileMenuOpen(false)} className="block border-b border-[#3a2a20] py-4 font-serif text-xl font-semibold">
                  {item.label}
                </Link>
              )
            )}
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#d7a24a] px-5 text-sm font-semibold text-[#120c08] transition-colors hover:bg-[#e8b661]">
              Acceso interno
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
