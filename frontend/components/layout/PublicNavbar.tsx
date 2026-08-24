"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Menu, X } from "lucide-react"

import { Logo } from "@/components/Logo"
import { SocialIcon, SocialNetwork } from "@/components/SocialNetworks"
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
      { href: "/nosotros", label: "Acerca de ACARO", info: "Conoce nuestra historia, misión y propósito." },
      { href: "/productores", label: "Gente del Café Robusta", info: "Explora el mapa territorial y conoce a las personas de la cadena de valor." },
      { href: "/noticias", label: "Noticias y novedades", info: "Consulta avances, eventos y comunicados de la comunidad." },
      { href: "/encuestas", label: "Encuestas", info: "Participa en consultas abiertas de la Asociación." },
    ],
  },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/biblioteca", label: "Biblioteca" },
  { href: "/servicios", label: "Servicios" },
]

export function PublicNavbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <header
      style={{ viewTransitionName: 'site-header' }}
      className="sticky top-0 z-50 h-[72px] w-full text-[#f8efe3] border-b border-[#3a2a20]/80 bg-[#120c08]"
    >
      <div className="mx-auto h-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex h-full items-center justify-between">
          <Link
            href="/"
            aria-label="Ir al inicio"
            className="transition-opacity hover:opacity-80"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            }}
          >
            <Logo variant="white" className="[&_span]:text-[16px] [&_span]:leading-[0.95]" />
          </Link>

          <nav className="hidden items-center gap-4 md:flex lg:gap-7">
            {navItems.map((item) =>
              item.submenu ? (
                <div key={item.label} className="group relative">
                  <button className={cn(
                    "flex items-center gap-1.5 py-6 text-sm font-medium transition-colors hover:text-white",
                    item.submenu.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'))
                      ? "text-white"
                      : "text-[#d8c9bb]"
                  )}>
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute left-1/2 top-full w-[340px] -translate-x-1/2 -translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="rounded-2xl border border-[#2a1a12]/80 bg-[#120a06] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          target={sub.href.startsWith("http") ? "_blank" : undefined}
                          rel={sub.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="group/sub flex items-start gap-3 rounded-xl p-4 transition-colors hover:bg-white/5"
                        >
                          {sub.social && (
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#d8c9bb] transition-colors group-hover/sub:bg-white/10 group-hover/sub:text-white">
                              <SocialIcon network={sub.social} className="h-4 w-4" />
                            </span>
                          )}
                          <span className="flex flex-col">
                            <span className="text-[15px] font-bold tracking-tight text-white transition-colors">
                              {sub.label}
                            </span>
                            {sub.info && (
                              <span className="mt-1.5 text-[13px] leading-relaxed text-[#9ca3af] transition-colors group-hover/sub:text-[#d1d5db]">
                                {sub.info}
                              </span>
                            )}
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
                    "relative py-6 text-sm font-medium transition-colors hover:text-white",
                    pathname === item.href ? "text-white" : "text-[#d8c9bb]"
                  )}
                >
                  {item.label}
                  {pathname === item.href && <span className="absolute inset-x-0 bottom-4 mx-auto h-px w-4 bg-white" />}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/contacto" className="bg-white px-6 py-2 text-xs font-bold uppercase tracking-widest text-[#271310] transition-all hover:bg-[#f3ede3]">
              Contacto
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

      <div className={cn("grid border-t border-[#3a2a20] bg-[#120c08] transition-[grid-template-rows,opacity] duration-300 md:hidden", isMobileMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="max-h-[80vh] overflow-y-auto px-5 py-5 sm:px-8">
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
                        className="flex items-center gap-3 py-2.5 text-sm text-[#d8c9bb] transition-colors hover:text-white"
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
            <div className="pt-5 pb-2">
              <Link
                href="/contacto"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full bg-white py-3 text-center text-xs font-bold uppercase tracking-widest text-[#271310] transition-all hover:bg-[#f3ede3]"
              >
                Contactar a ACARO
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
