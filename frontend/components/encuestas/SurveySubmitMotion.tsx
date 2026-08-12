'use client'

import { useEffect, useRef, type RefObject } from 'react'

export type SubmitMotionPhase = 'idle' | 'preparing' | 'flying' | 'waiting' | 'success' | 'error'

interface Props {
  phase: SubmitMotionPhase
  containerRef: RefObject<HTMLElement | null>
  buttonRef: RefObject<HTMLButtonElement | null>
  onFlightStart: () => void
  onArrive: () => void
}

const easeInOut = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

function cubicPoint(t: number, p0: number, p1: number, p2: number, p3: number) {
  const mt = 1 - t
  return mt ** 3 * p0 + 3 * mt ** 2 * t * p1 + 3 * mt * t ** 2 * p2 + t ** 3 * p3
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function place(el: HTMLElement | null, x: number, y: number, extra = '') {
  if (!el) return
  el.style.transform = `translate3d(${x}px, ${y}px, 0) translate3d(-50%, -50%, 0)${extra}`
}

export function SurveySubmitMotion({
  phase,
  containerRef,
  buttonRef,
  onFlightStart,
  onArrive,
}: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const planeRef = useRef<HTMLDivElement | null>(null)
  const targetRef = useRef<HTMLSpanElement | null>(null)
  const launchRef = useRef<HTMLSpanElement | null>(null)
  const arrivalRef = useRef<HTMLSpanElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const timersRef = useRef<number[]>([])
  const arrivedRef = useRef(false)

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      timersRef.current.forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'idle' && phase !== 'error') return

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    arrivedRef.current = false

    const overlay = overlayRef.current
    overlay?.querySelectorAll('.survey-flight-particle').forEach(node => node.remove())
    if (planeRef.current) {
      planeRef.current.style.opacity = '0'
      planeRef.current.style.transform = 'translate3d(-999px, -999px, 0)'
    }
    targetRef.current?.classList.remove('is-visible', 'is-consuming')
    launchRef.current?.classList.remove('is-visible')
    arrivalRef.current?.classList.remove('is-visible')
  }, [phase])

  useEffect(() => {
    if (phase !== 'preparing') return

    if (prefersReducedMotion()) {
      const timer = window.setTimeout(() => {
        arrivedRef.current = true
        onArrive()
      }, 220)
      timersRef.current.push(timer)
      return
    }

    const timer = window.setTimeout(() => {
      const button = buttonRef.current
      const container = containerRef.current
      const plane = planeRef.current
      const target = targetRef.current
      const launch = launchRef.current
      if (!button || !container || !plane || !target) {
        arrivedRef.current = true
        onArrive()
        return
      }

      const buttonRect = button.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const start = {
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2,
      }
      const end = {
        x: containerRect.left + containerRect.width / 2,
        y: Math.max(containerRect.top + 78, containerRect.top + containerRect.height * 0.18),
      }
      const horizontal = Math.max(48, Math.abs(end.x - start.x))
      const control1 = {
        x: start.x - Math.min(64, horizontal * 0.16),
        y: start.y - Math.min(96, Math.max(54, containerRect.height * 0.12)),
      }
      const control2 = {
        x: end.x + Math.min(64, horizontal * 0.2),
        y: end.y + Math.min(118, Math.max(70, containerRect.height * 0.14)),
      }

      onFlightStart()
      target.classList.remove('is-consuming')
      target.classList.add('is-visible')
      place(target, end.x, end.y)
      if (launch) {
        launch.classList.add('is-visible')
        place(launch, start.x, start.y)
        const launchTimer = window.setTimeout(() => launch.classList.remove('is-visible'), 520)
        timersRef.current.push(launchTimer)
      }

      plane.style.opacity = '1'
      place(plane, start.x, start.y, ' rotate(-18deg) scale(1.06)')

      const duration = 1080
      let lastParticleAt = 0
      const startedAt = performance.now()
      const curlRadius = Math.min(24, Math.max(12, containerRect.width * 0.032))

      const flightPoint = (rawProgress: number) => {
        const clamped = Math.min(1, Math.max(0, rawProgress))
        const progress = easeInOut(clamped)
        const baseX = cubicPoint(progress, start.x, control1.x, control2.x, end.x)
        const baseY = cubicPoint(progress, start.y, control1.y, control2.y, end.y)
        const curl = Math.sin(clamped * Math.PI * 1.2) * curlRadius * Math.sin(clamped * Math.PI)
        const lift = Math.sin(clamped * Math.PI) * Math.min(22, containerRect.height * 0.028)
        return { x: baseX + curl * 0.45, y: baseY - lift }
      }

      const addParticle = (x: number, y: number, angle: number) => {
        const overlay = overlayRef.current
        if (!overlay) return
        const particle = document.createElement('span')
        particle.className = Math.random() < 0.08
          ? 'survey-flight-particle survey-flight-leaf'
          : 'survey-flight-particle'
        particle.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`
        overlay.appendChild(particle)
        const particleTimer = window.setTimeout(() => particle.remove(), 560)
        timersRef.current.push(particleTimer)
      }

      const frame = (now: number) => {
        const rawT = Math.min(1, (now - startedAt) / duration)
        const progress = easeInOut(rawT)
        const point = flightPoint(rawT)
        const nextPoint = flightPoint(Math.min(1, rawT + 0.018))
        const dx = nextPoint.x - point.x
        const dy = nextPoint.y - point.y
        const angle = Math.atan2(dy, dx) * 180 / Math.PI + 8 + Math.sin(rawT * Math.PI) * 5
        const entering = rawT > 0.78 ? Math.min(1, (rawT - 0.78) / 0.22) : 0
        const scale = 1.06 - progress * 0.28 - entering * 0.48
        const opacity = rawT > 0.9 ? Math.max(0, (1 - rawT) / 0.1) : 1

        plane.style.opacity = String(opacity)
        place(plane, point.x, point.y, ` rotate(${angle}deg) scale(${scale})`)

        if (now - lastParticleAt > 112 && rawT > 0.08 && rawT < 0.82) {
          lastParticleAt = now
          addParticle(
            point.x - Math.cos(Math.atan2(dy, dx)) * 16,
            point.y - Math.sin(Math.atan2(dy, dx)) * 16,
            angle + (Math.random() * 18 - 9)
          )
        }

        if (rawT < 1) {
          rafRef.current = requestAnimationFrame(frame)
        } else {
          arrivedRef.current = true
          plane.style.opacity = '0'
          place(plane, end.x, end.y, ` rotate(${angle}deg) scale(0.08)`)
          target.classList.add('is-consuming')
          onArrive()
        }
      }

      rafRef.current = requestAnimationFrame(frame)
    }, 560)

    timersRef.current.push(timer)
  }, [buttonRef, containerRef, onArrive, onFlightStart, phase])

  useEffect(() => {
    if (phase !== 'success' || !arrivedRef.current) return

    targetRef.current?.classList.add('is-consuming')
    arrivalRef.current?.classList.add('is-visible')
    const timer = window.setTimeout(() => {
      targetRef.current?.classList.remove('is-visible', 'is-consuming')
      arrivalRef.current?.classList.remove('is-visible')
      overlayRef.current?.querySelectorAll('.survey-flight-particle').forEach(node => node.remove())
    }, 620)
    timersRef.current.push(timer)
  }, [phase])

  if (phase === 'idle' || phase === 'error') return null

  return (
    <div ref={overlayRef} className="survey-submit-motion" aria-hidden="true">
      <span ref={targetRef} className="survey-flight-target" />
      <span ref={launchRef} className="survey-launch-burst" />
      <div ref={planeRef} className="survey-flight-plane">
        <svg viewBox="0 0 42 42" className="h-full w-full" fill="none">
          <path d="M4.8 20.6 36.2 6.7 27.1 35.6 19.9 24.2 4.8 20.6Z" fill="currentColor" />
          <path d="M19.9 24.2 36.2 6.7 15.8 26.7 16.9 34.1 19.9 24.2Z" fill="rgba(255,255,255,.34)" />
          <path d="M19.9 24.2 27.1 35.6 23.1 25.6" stroke="rgba(255,255,255,.42)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
      <span ref={arrivalRef} className="survey-arrival-mark">
        <span />
        <span />
      </span>
    </div>
  )
}