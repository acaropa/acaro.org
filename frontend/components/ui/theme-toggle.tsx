"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant="ghost" size="icon" className={cn("w-9 h-9 opacity-0", className)} />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("w-9 h-9 text-muted hover:text-foreground", className)}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Alternar tema"
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
