"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/context/AuthContext"
import { PERMISSIONS, hasAnyPermission } from "@/lib/permissions"

const navigation = [
  { name: "Inicio", href: "/admin", icon: "home", permissions: [] },
  {
    name: "Proyectos",
    href: "/admin/proyectos",
    icon: "account_tree",
    permissions: [PERMISSIONS.PROYECTOS_READ_ASSIGNED, PERMISSIONS.PROYECTOS_READ_PRIVATE],
  },
  {
    name: "Biblioteca",
    href: "/admin/biblioteca",
    icon: "import_contacts",
    permissions: [PERMISSIONS.BIBLIOTECA_READ_INTERNAL, PERMISSIONS.BIBLIOTECA_UPLOAD_OWN],
  },
  {
    name: "Notas conceptuales",
    href: "/admin/notas-conceptuales",
    icon: "contract_edit",
    permissions: [],
  },
  {
    name: "Noticias",
    href: "/admin/noticias",
    icon: "newspaper",
    permissions: [PERMISSIONS.NOTICIAS_CREATE, PERMISSIONS.NOTICIAS_UPDATE],
  },
  {
    name: "Productores",
    href: "/admin/productores",
    icon: "agriculture",
    permissions: [PERMISSIONS.PRODUCTORES_CREATE, PERMISSIONS.PRODUCTORES_UPDATE],
  },
  {
    name: "Técnicos",
    href: "/admin/tecnicos",
    icon: "engineering",
    permissions: [PERMISSIONS.TECNICOS_READ],
  },
  {
    name: "Socios",
    href: "/admin/socios",
    icon: "groups",
    permissions: [PERMISSIONS.SOCIOS_READ],
  },
  {
    name: "Usuarios",
    href: "/admin/usuarios",
    icon: "manage_accounts",
    permissions: [PERMISSIONS.USUARIOS_READ],
  },
  {
    name: "Configuración",
    href: "/admin/configuracion",
    icon: "settings",
    permissions: [PERMISSIONS.CONFIGURACION_MANAGE],
  },
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const visibleNavigation = navigation.filter(item =>
    item.permissions.length === 0 || hasAnyPermission(user?.permissions, item.permissions)
  )

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[1px] md:hidden"
        />
      )}
      <nav
        aria-hidden={!isOpen}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-outline-variant/30 bg-surface-container-lowest py-8 shadow-sm transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
      <div className="px-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="shrink-0 flex items-center justify-center">
            <Logo variant="normal" showText={false} className="!gap-0" />
          </div>
          <div className="overflow-hidden">
            <h2 className="font-headline-md text-[16px] leading-[1.2] font-bold text-primary tracking-widest whitespace-nowrap">
              ACARO
            </h2>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full mt-4 flex-1 overflow-y-auto">
        {visibleNavigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 py-3 w-full transition-all duration-200",
                isActive
                  ? "text-primary font-bold border-l-4 border-primary pl-4 scale-[0.99] bg-surface-container-low"
                  : "text-secondary pl-5 hover:bg-surface-container-low"
              )}
            >
              <span
                className="material-symbols-outlined"
                data-weight={isActive ? "fill" : undefined}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="font-label-caps text-label-caps">{item.name}</span>
            </Link>
          )
        })}
      </div>

      {/* Logout options */}
      <div className="border-t border-outline-variant/30 p-4 mt-auto">
        <button
          onClick={() => void logout()}
          className="group flex w-full items-center gap-3 py-3 pl-1 text-secondary hover:bg-red-500/10 hover:text-red-700 transition-colors rounded-md"
        >
          <span className="material-symbols-outlined ml-4">logout</span>
          <span className="font-label-caps text-label-caps">Cerrar sesión</span>
        </button>
        <button
          onClick={() => void logout(true)}
          className="mt-1 w-full px-5 py-2 text-left text-[10px] uppercase tracking-wider text-secondary/60 hover:text-red-500 font-bold"
        >
          Cerrar todas las sesiones
        </button>
      </div>
      </nav>
    </>
  )
}
