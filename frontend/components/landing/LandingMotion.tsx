"use client"

import Image from "next/image"
import * as React from "react"

import { cn } from "@/lib/utils"

type ScrollRevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  distance?: "sm" | "md" | "lg"
  direction?: "up" | "left" | "right"
}

type ScrollSceneProps = {
  children: React.ReactNode
  className?: string
}

export function ScrollScene({ children, className }: ScrollSceneProps) {
  const ref = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const element = ref.current
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    let isNearViewport = false
    let currentProgress = 0
    let targetProgress = 0

    const measure = () => {
      if (!isNearViewport) return

      const rect = element.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const start = viewportHeight * 0.92
      const end = -rect.height * 0.12
      targetProgress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)))
    }

    const render = () => {
      const delta = targetProgress - currentProgress
      currentProgress += delta * 0.12

      if (Math.abs(delta) < 0.0005) currentProgress = targetProgress
      element.style.setProperty("--scene-progress", currentProgress.toFixed(4))

      if (isNearViewport && currentProgress !== targetProgress) {
        frame = window.requestAnimationFrame(render)
      } else {
        frame = 0
      }
    }

    const queueRender = () => {
      measure()
      if (!frame) frame = window.requestAnimationFrame(render)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearViewport = entry.isIntersecting
        element.dataset.sceneActive = String(isNearViewport)
        if (isNearViewport) queueRender()
      },
      { rootMargin: "45% 0px" }
    )

    observer.observe(element)
    window.addEventListener("scroll", queueRender, { passive: true })
    window.addEventListener("resize", queueRender)

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", queueRender)
      window.removeEventListener("resize", queueRender)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section ref={ref} className={cn("motion-scene", className)}>
      {children}
    </section>
  )
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  distance = "md",
  direction = "up",
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        element.dataset.visible = "true"
        observer.unobserve(element)
      },
      { threshold: 0.08, rootMargin: "0px 0px -12% 0px" }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn("scroll-reveal", className)}
      data-distance={distance}
      data-direction={direction}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export function HeroParallaxImage() {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const element = ref.current
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    const update = () => {
      frame = 0
      const isMobile = window.innerWidth < 640
      const offset = Math.min(window.scrollY * (isMobile ? 0.035 : 0.08), isMobile ? 22 : 56)
      element.style.transform = `translate3d(0, ${offset}px, 0) scale(1.06)`
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={ref} className="absolute -inset-y-8 inset-x-0 will-change-transform">
      <Image
        src="/assets/library-hero-v2.png"
        alt="Cultivo de café robusta al amanecer"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />
    </div>
  )
}
