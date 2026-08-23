import Image from "next/image"

import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "normal" | "white" | "chocolate" | "color"
  className?: string
  showText?: boolean
}

export function Logo({ variant = "normal", className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("relative flex shrink-0 items-center justify-center", variant === "white" && "brightness-0 invert")}>
        <Image
          src="/assets/logos/logo-navbar.png"
          alt="Logo de Asociación Café Robusta OBC"
          width={48}
          height={48}
          loading="eager"
          className="h-10 w-10 object-contain md:h-12 md:w-12"
        />
      </div>
      {showText && (
        <span className={cn("text-lg font-bold leading-none tracking-tight md:text-xl", variant === "white" ? "text-white" : "text-primary dark:text-foreground")}>
          Asociación Café<br />Robusta OBC
        </span>
      )}
    </div>
  )
}
