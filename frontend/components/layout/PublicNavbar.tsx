"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Logo } from "@/components/Logo"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { SocialIcon, SocialNetwork, socialNetworks } from "@/components/SocialNetworks"

type NavItem = {
  href?: string;
  label: string;
  submenu?: { href: string; label: string; info?: string; social?: SocialNetwork }[];
};

const navItems: NavItem[] = [
  { href: "/", label: "Inicio" },
  { 
    label: "Nosotros", 
    submenu: [
      { href: "/nosotros", label: "Acerca de la Asociación", info: "Conoce nuestra historia, misión y propósito." },
      { href: "/nosotros/equipo", label: "Mesa Directiva", info: "Conoce al equipo que lidera nuestra organización." },
      { href: "/nosotros/transparencia", label: "Transparencia", info: "Informes y documentación oficial." }
    ]
  },
  { 
    label: "Proyectos", 
    submenu: [
      { href: "/proyectos", label: "Todos los proyectos", info: "Explora todas nuestras iniciativas." },
      { href: "/proyectos/ejecucion", label: "En ejecución", info: "Proyectos actualmente activos." },
      { href: "/proyectos/completados", label: "Completados", info: "Casos de éxito y resultados alcanzados." }
    ]
  },
  { href: "/biblioteca", label: "Biblioteca" },
  { 
    label: "Redes", 
    submenu: socialNetworks.map(network => ({ ...network, social: network.id }))
  },
]

export function PublicNavbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item, idx) => (
              item.submenu ? (
                <div key={idx} className="relative group">
                  <button className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-accent text-muted py-4">
                    {item.label}
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-surface border border-border rounded-xl shadow-xl p-3 w-72 flex flex-col gap-1 relative before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-surface">
                      {item.submenu.map(sub => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          target={sub.href.startsWith("http") ? "_blank" : undefined}
                          rel={sub.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="group/sub flex items-start gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors"
                        >
                          {sub.social && (
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                              <SocialIcon network={sub.social} className="h-5 w-5" />
                            </span>
                          )}
                          <span className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground group-hover/sub:text-accent">{sub.label}</span>
                            {sub.info && <span className="text-xs text-muted mt-1 leading-snug">{sub.info}</span>}
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
                    "text-sm font-medium transition-colors hover:text-accent py-4",
                    pathname === item.href ? "text-accent" : "text-muted"
                  )}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Button asChild variant="secondary" className="font-semibold shadow-sm">
              <Link href="/login">Acceso interno</Link>
            </Button>
          </div>

          <div className="flex items-center md:hidden gap-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface shadow-inner">
          <div className="px-4 pt-4 pb-6 space-y-2 max-h-[80vh] overflow-y-auto">
            {navItems.map((item, idx) => (
              item.submenu ? (
                <div key={idx} className="space-y-1 mb-2">
                  <div className="px-3 py-2 text-base font-semibold text-foreground border-b border-border/50">
                    {item.label}
                  </div>
                  <div className="pl-4 space-y-1 border-l-2 border-border/50 ml-4 py-2">
                    {item.submenu.map(sub => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        target={sub.href.startsWith("http") ? "_blank" : undefined}
                        rel={sub.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                      >
                        {sub.social && <SocialIcon network={sub.social} className="h-5 w-5 shrink-0" />}
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-3 rounded-md text-base font-medium transition-colors",
                    pathname === item.href
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-surface/80 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            ))}
            <div className="pt-6 pb-2 px-3">
              <Button asChild variant="secondary" className="w-full justify-center shadow-sm">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Acceso interno</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
