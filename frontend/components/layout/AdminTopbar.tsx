"use client"

import { useAuth } from "@/context/AuthContext"

interface AdminTopbarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function AdminTopbar({ sidebarOpen, onToggleSidebar }: AdminTopbarProps) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-5 py-4 bg-[#fffdf8]/95 backdrop-blur-xl border-b border-[#d8cabb] md:px-16">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Cerrar menú lateral" : "Abrir menú lateral"}
          aria-expanded={sidebarOpen}
          className="flex h-10 w-10 items-center justify-center rounded-md text-[#2b1710] transition-colors duration-200 hover:bg-[#fbf7f0]"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="hidden lg:flex items-center border-b border-[#d8cabb] pb-1">
          <span className="material-symbols-outlined text-[#5a3424] mr-2">search</span>
          <input className="bg-transparent border-none focus:outline-none focus:ring-0 text-[15px] text-[#2b1710] placeholder:text-[#765e50] w-48" placeholder="Buscar..." type="text" />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-[#765e50] hover:text-[#2b1710] transition-colors duration-200">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-[#765e50] hover:text-[#2b1710] transition-colors duration-200">
            <span className="material-symbols-outlined">settings</span>
          </button>
          
          <div className="h-8 w-8 rounded-full border border-[#d8cabb] bg-[#f3e8d8] flex items-center justify-center text-[#2b1710] font-bold shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}
