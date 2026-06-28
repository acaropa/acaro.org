import { ViewTransition } from "react"
import { PublicNavbar } from "./PublicNavbar"
import { PublicFooter } from "./PublicFooter"
import { cn } from "@/lib/utils"

export function PublicLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-screen flex-col", className)}>
      <PublicNavbar />
      <ViewTransition name="page-content">
        <main className="flex-1">{children}</main>
      </ViewTransition>
      <PublicFooter />
    </div>
  )
}
