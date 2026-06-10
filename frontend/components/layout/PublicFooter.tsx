import Link from "next/link"
import { Logo } from "@/components/Logo"

export function PublicFooter() {
  return (
    <footer className="bg-[#120C08] text-[#F8EFE3] pt-16 pb-8 border-t border-[#3A2A20]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Logo variant="white" />
            <p className="mt-4 text-sm text-[#B8A99A] max-w-sm">
              Impulsando el desarrollo del café robusta con organización, tecnología y visión productiva en la región.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm text-[#B8A99A]">
              <li><Link href="/nosotros" className="hover:text-[#D7A24A] transition-colors">Nosotros</Link></li>
              <li><Link href="/proyectos" className="hover:text-[#D7A24A] transition-colors">Proyectos</Link></li>
              <li><Link href="/biblioteca" className="hover:text-[#D7A24A] transition-colors">Biblioteca</Link></li>
              <li><Link href="/noticias" className="hover:text-[#D7A24A] transition-colors">Noticias</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-[#B8A99A]">
              <li>contacto@asociacioncaferobusta.org</li>
              <li>+593 99 999 9999</li>
              <li>Oficina Central, Ecuador</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-[#3A2A20] text-center text-xs text-[#B8A99A]">
          <p>© {new Date().getFullYear()} Asociación Café Robusta OBC. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
