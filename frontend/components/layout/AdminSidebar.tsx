"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderKanban, BookOpen, Newspaper, Users, Settings, LogOut, UserRoundCog, ContactRound } from "lucide-react"

import { cn } from "@/lib/utils"
import { Logo } from "@/components/Logo"
import { useAuth } from "@/context/AuthContext"
import { PERMISSIONS, hasAnyPermission } from "@/lib/permissions"

const navigation = [
  { name: "Panel", href: "/admin", icon: LayoutDashboard, permissions: [] },
  {
    name: "Proyectos",
    href: "/admin/proyectos",
    icon: FolderKanban,
    permissions: [PERMISSIONS.PROYECTOS_READ_ASSIGNED, PERMISSIONS.PROYECTOS_READ_PRIVATE],
  },
  {
    name: "Biblioteca",
    href: "/admin/biblioteca",
    icon: BookOpen,
    permissions: [PERMISSIONS.BIBLIOTECA_READ_INTERNAL, PERMISSIONS.BIBLIOTECA_UPLOAD_OWN],
  },
  {
    name: "Noticias",
    href: "/admin/noticias",
    icon: Newspaper,
    permissions: [PERMISSIONS.NOTICIAS_CREATE, PERMISSIONS.NOTICIAS_UPDATE],
  },
  {
    name: "Técnicos",
    href: "/admin/tecnicos",
    icon: UserRoundCog,
    permissions: [PERMISSIONS.TECNICOS_READ],
  },
  {
    name: "Socios",
    href: "/admin/socios",
    icon: ContactRound,
    permissions: [PERMISSIONS.SOCIOS_READ],
  },
  {
    name: "Usuarios",
    href: "/admin/usuarios",
    icon: Users,
    permissions: [PERMISSIONS.USUARIOS_READ],
  },
  {
    name: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
    permissions: [PERMISSIONS.CONFIGURACION_MANAGE],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const visibleNavigation = navigation.filter(item =>
    item.permissions.length === 0 || hasAnyPermission(user?.permissions, item.permissions)
  )

  return (
    <div className="flex h-full w-64 flex-col bg-primary dark:bg-card border-r border-border text-primary-foreground dark:text-foreground shadow-sm">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/10 dark:border-border">
        <Logo variant="white" className="dark:hidden" />
        <Logo variant="normal" className="hidden dark:flex" />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-4 py-6">
          {visibleNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-white"
                    : "text-primary-foreground/80 dark:text-muted hover:bg-white/10 dark:hover:bg-surface hover:text-white dark:hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 shrink-0",
                    isActive ? "text-white" : "text-primary-foreground/60 dark:text-muted group-hover:text-white dark:group-hover:text-foreground"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-white/10 dark:border-border p-4">
          <button
            onClick={logout}
            className="group flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium text-primary-foreground/80 dark:text-muted hover:bg-red-500/10 hover:text-red-400 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 shrink-0 text-primary-foreground/60 dark:text-muted group-hover:text-red-400" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
