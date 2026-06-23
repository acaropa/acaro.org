"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  BookOpen,
  Building2,
  ChevronDown,
  ClipboardList,
  FilePenLine,
  GitBranch,
  Globe2,
  HardHat,
  Home,
  LogOut,
  Newspaper,
  Settings,
  ShieldCheck,
  Tractor,
  UserCog,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/context/AuthContext"
import { PERMISSIONS, hasAnyPermission } from "@/lib/permissions"

const navigation = [
  { name: "Inicio", href: "/admin", icon: Home, permissions: [] },
  {
    name: "Proyectos",
    href: "/admin/proyectos",
    icon: GitBranch,
    permissions: [PERMISSIONS.PROYECTOS_READ_ASSIGNED, PERMISSIONS.PROYECTOS_READ_PRIVATE],
  },
  {
    name: "Información",
    icon: Building2,
    subItems: [
      {
        name: "Noticias",
        href: "/admin/noticias",
        icon: Newspaper,
        permissions: [PERMISSIONS.NOTICIAS_CREATE, PERMISSIONS.NOTICIAS_UPDATE],
      },
      {
        name: "Biblioteca",
        href: "/admin/biblioteca",
        icon: BookOpen,
        permissions: [PERMISSIONS.BIBLIOTECA_READ_INTERNAL, PERMISSIONS.BIBLIOTECA_UPLOAD_OWN],
      },
      {
        name: "Documentos institucionales",
        href: "/admin/notas-conceptuales",
        icon: FilePenLine,
        permissions: [],
      },
      {
        name: "Encuestas",
        href: "/admin/encuestas",
        icon: ClipboardList,
        permissions: [PERMISSIONS.ENCUESTAS_READ, PERMISSIONS.ENCUESTAS_CREATE],
      },
    ]
  },
  {
    name: "Comunidad",
    icon: Globe2,
    subItems: [
      {
        name: "Productores",
        href: "/admin/productores",
        icon: Tractor,
        permissions: [PERMISSIONS.PRODUCTORES_CREATE, PERMISSIONS.PRODUCTORES_UPDATE],
      },
      {
        name: "Técnicos",
        href: "/admin/tecnicos",
        icon: HardHat,
        permissions: [PERMISSIONS.TECNICOS_READ],
      },
      {
        name: "Socios",
        href: "/admin/socios",
        icon: Users,
        permissions: [PERMISSIONS.SOCIOS_READ],
      },
    ]
  },
  {
    name: "Administración",
    icon: ShieldCheck,
    subItems: [
      {
        name: "Usuarios",
        href: "/admin/usuarios",
        icon: UserCog,
        permissions: [PERMISSIONS.USUARIOS_READ],
      },
      {
        name: "Configuración",
        href: "/admin/configuracion",
        icon: Settings,
        permissions: [PERMISSIONS.CONFIGURACION_MANAGE],
      },
    ]
  }
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const toggleGroup = (name: string) => {
    setOpenGroups(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const hasPermission = (permissions?: string[]) => {
    if (!permissions || permissions.length === 0) return true
    return hasAnyPermission(user?.permissions, permissions)
  }

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
          "fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-[#e5e7eb] bg-white py-7 shadow-[8px_0_30px_rgba(15,23,42,0.05)] transition-transform duration-300 ease-out",
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
          {navigation.map(item => {
            const ItemIcon = item.icon
            if (item.subItems) {
              const visibleSubItems = item.subItems.filter(subItem => hasPermission(subItem.permissions))
              if (visibleSubItems.length === 0) return null

              const isGroupActive = visibleSubItems.some(subItem => pathname === subItem.href || (subItem.href !== "/admin" && pathname.startsWith(`${subItem.href}/`)))
              const isGroupOpen = openGroups[item.name] ?? isGroupActive

              return (
                <div key={item.name} className="flex flex-col gap-1">
                  <button
                    onClick={() => toggleGroup(item.name)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-3 transition-all duration-200",
                      "text-[#5a3424] hover:bg-[#f3f4f6] hover:text-[#2b1710]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <ItemIcon className="h-[21px] w-[21px]" aria-hidden="true" />
                      <span className="text-[14px] font-semibold tracking-normal">{item.name}</span>
                    </div>
                    <ChevronDown className={cn("h-[18px] w-[18px] transition-transform duration-200", isGroupOpen && "rotate-180")} aria-hidden="true" />
                  </button>
                  {isGroupOpen && (
                    <div className="flex flex-col gap-1 mb-1">
                      {visibleSubItems.map(subItem => {
                        const isActive = pathname === subItem.href || (subItem.href !== "/admin" && pathname.startsWith(`${subItem.href}/`))
                        const SubItemIcon = subItem.icon
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg py-2 pr-3 pl-11 transition-all duration-200",
                              isActive
                                ? "bg-[#5a3424]/12 text-[#3d2118] ring-1 ring-inset ring-[#5a3424]/10"
                                : "text-[#5a3424] hover:bg-[#f3f4f6] hover:text-[#2b1710]"
                            )}
                          >
                            <SubItemIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                            <span className="text-[13px] font-semibold tracking-normal">{subItem.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            if (!hasPermission(item.permissions)) return null

            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`))
            return (
              <Link
                key={item.name}
                href={item.href!}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200",
                  isActive
                    ? "bg-[#5a3424]/12 text-[#3d2118] ring-1 ring-inset ring-[#5a3424]/10"
                    : "text-[#5a3424] hover:bg-[#f3f4f6] hover:text-[#2b1710]"
                )}
              >
                <ItemIcon className="h-[21px] w-[21px]" aria-hidden="true" />
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
            <LogOut className="h-[21px] w-[21px]" aria-hidden="true" />
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
