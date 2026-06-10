import Link from "next/link"
import { Mail, MapPin } from "lucide-react"

import { Logo } from "@/components/Logo"
import { ScrollReveal } from "@/components/landing/LandingMotion"
import { SocialIcon, socialNetworks } from "@/components/SocialNetworks"

export function PublicFooter() {
  return (
    <footer className="border-t border-[#3a2a20] bg-[#120c08] text-[#f8efe3]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_0.7fr_0.8fr]">
          <ScrollReveal distance="sm">
            <Logo variant="white" />
            <p className="mt-6 max-w-md text-sm leading-7 text-[#b8a99a]">
              Organización de productores comprometida con el desarrollo técnico, sostenible y competitivo del café robusta en Panamá.
            </p>
            <div className="mt-7">
              <p className="text-sm font-semibold text-[#f8efe3]">Redes Sociales</p>
              <div className="mt-3 flex items-center gap-3">
                {socialNetworks.map((network) => (
                  <a
                    key={network.id}
                    href={network.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={network.label}
                    title={network.label}
                    className="text-[#b8a99a] transition-all duration-300 hover:-translate-y-0.5 hover:text-[#d7a24a]"
                  >
                    <SocialIcon network={network.id} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100} distance="sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d7a24a]">Enlaces rápidos</p>
            <nav className="mt-6 flex flex-col gap-4 text-sm text-[#d8c9bb]">
              <Link href="/" className="hover:text-white">Inicio</Link>
              <Link href="/nosotros" className="hover:text-white">Nosotros</Link>
              <Link href="/proyectos" className="hover:text-white">Proyectos</Link>
              <Link href="/biblioteca" className="hover:text-white">Biblioteca</Link>
              <Link href="/contacto" className="hover:text-white">Contacto</Link>
            </nav>
          </ScrollReveal>

          <ScrollReveal delay={200} distance="sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d7a24a]">Contacto</p>
            <div className="mt-6 space-y-5 text-sm leading-6 text-[#d8c9bb]">
              <a href="mailto:contacto@acaro.org" className="flex items-start gap-3 hover:text-white">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#d7a24a]" />contacto@acaro.org
              </a>
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#d7a24a]" />República de Panamá
              </p>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal className="mt-16 flex flex-col gap-3 border-t border-[#3a2a20] pt-7 text-xs text-[#82766d] sm:flex-row sm:items-center sm:justify-between" delay={260} distance="sm">
          <p>© {new Date().getFullYear()} Asociación Café Robusta OBC. Todos los derechos reservados.</p>
          <p>Organización · Conocimiento · Producción</p>
        </ScrollReveal>
      </div>
    </footer>
  )
}
