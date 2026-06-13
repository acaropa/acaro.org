"use client"

import { useAuth } from "@/context/AuthContext"

export function AdminTopbar() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-5 py-4 bg-surface-bright/95 backdrop-blur-sm border-b border-outline-variant/30 md:px-16">
      <div className="flex items-center gap-4">
        <span className="md:hidden material-symbols-outlined text-primary cursor-pointer hover:text-primary transition-colors duration-200">menu</span>
      </div>
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="hidden lg:flex items-center border-b border-outline-variant pb-1">
          <span className="material-symbols-outlined text-secondary mr-2">search</span>
          <input className="bg-transparent border-none focus:outline-none focus:ring-0 font-body-md text-[16px] text-primary placeholder:text-secondary w-48" placeholder="Buscar..." type="text" />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary transition-colors duration-200">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors duration-200">
            <span className="material-symbols-outlined">settings</span>
          </button>
          
          <div className="h-8 w-8 rounded-full border border-outline-variant bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold font-data-mono shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}
