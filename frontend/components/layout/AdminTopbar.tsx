"use client"

import { Bell, Menu, Search, Settings } from "lucide-react"

import { useAuth } from "@/context/AuthContext"

interface AdminTopbarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function AdminTopbar({ sidebarOpen, onToggleSidebar }: AdminTopbarProps) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-5 py-4 bg-white/95 backdrop-blur-xl border-b border-[#d8cabb] md:px-16">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Cerrar menú lateral" : "Abrir menú lateral"}
          aria-expanded={sidebarOpen}
          className="flex h-10 w-10 items-center justify-center rounded-md text-[#2b1710] transition-colors duration-200 hover:bg-[#faf9f5]"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="hidden lg:flex items-center border-b border-[#d8cabb] pb-1">
          <Search className="mr-2 h-5 w-5 text-[#5a3424]" aria-hidden="true" />
          <input className="bg-transparent border-none focus:outline-none focus:ring-0 text-[15px] text-[#2b1710] placeholder:text-[#765e50] w-48" placeholder="Buscar..." type="text" />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-[#765e50] hover:text-[#2b1710] transition-colors duration-200">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>
          <button className="text-[#765e50] hover:text-[#2b1710] transition-colors duration-200">
            <Settings className="h-5 w-5" aria-hidden="true" />
          </button>
          
          <div className="h-8 w-8 rounded-full border border-[#d8cabb] bg-[#faf9f5] flex items-center justify-center text-[#2b1710] font-bold shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}
