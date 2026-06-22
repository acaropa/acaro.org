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
    name: "Tecnicos",
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
    name: "Encuestas",
    href: "/admin/encuestas",
    icon: "assignment",
    permissions: [PERMISSIONS.ENCUESTAS_READ, PERMISSIONS.ENCUESTAS_CREATE],
  },
  {
    name: "Configuracion",
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
          aria-label="Cerrar menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[1px] md:hidden"
        />
      )}
      <nav
        aria-hidden={!isOpen}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-[#d8cabb] bg-[#fffdf8] py-7 shadow-[8px_0_30px_rgba(43,23,16,0.06)] transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-8 px-6">
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 items-center justify-center">
              <Logo variant="normal" showText={false} className="!gap-0 [&_img]:h-11 [&_img]:w-11" />
            </div>
            <div className="overflow-hidden">
              <h2 className="whitespace-nowrap text-[22px] font-bold leading-none tracking-[0.14em] text-[#2b1710]">
                ACARO
              </h2>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a66f2e]">
                Admin
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2 flex w-full flex-1 flex-col gap-1.5 overflow-y-auto px-3">
          {visibleNavigation.map(item => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200",
                  isActive
                    ? "bg-[#2b1710] text-[#fffaf1] shadow-[0_10px_24px_rgba(43,23,16,0.12)]"
                    : "text-[#5a3424] hover:bg-[#fbf7f0] hover:text-[#2b1710]"
                )}
              >
                <span
                  className="material-symbols-outlined text-[21px]"
                  data-weight={isActive ? "fill" : undefined}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="text-[14px] font-semibold tracking-normal">{item.name}</span>
              </Link>
            )
          })}
        </div>

        <div className="mt-auto border-t border-[#d8cabb] p-4">
          <button
            onClick={() => void logout()}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[#5a3424] transition-colors hover:bg-red-500/10 hover:text-red-700"
          >
            <span className="material-symbols-outlined text-[21px]">logout</span>
            <span className="text-[14px] font-semibold">Cerrar sesion</span>
          </button>
          <button
            onClick={() => void logout(true)}
            className="mt-1 w-full px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-[#765e50] hover:text-red-600"
          >
            Cerrar todas las sesiones
          </button>
        </div>
      </nav>
    </>
  )
}
