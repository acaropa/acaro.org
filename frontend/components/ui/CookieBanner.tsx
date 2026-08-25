"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { Cookie, X } from "lucide-react"

const STORAGE_KEY = "acaro_cookie_consent"
const CONSENT_EVENT = "acaro-cookie-consent-change"

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(CONSENT_EVENT, onStoreChange)

  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(CONSENT_EVENT, onStoreChange)
  }
}

function getSnapshot() {
  try {
    return !localStorage.getItem(STORAGE_KEY)
  } catch {
    return false
  }
}

function getServerSnapshot() {
  return false
}

export function CookieBanner() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function updateConsent(value: "accepted" | "dismissed") {
    try {
      localStorage.setItem(STORAGE_KEY, value)
      window.dispatchEvent(new Event(CONSENT_EVENT))
    } catch {
      // noop
    }
  }

  function accept() {
    updateConsent("accepted")
  }

  function dismiss() {
    updateConsent("dismissed")
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-[#3a2a20]/60 bg-[#120c08]/95 px-5 py-4 backdrop-blur-md sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg sm:rounded-2xl sm:border sm:border-[#3a2a20] sm:shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-start gap-3.5">
        {/* Cookie icon */}
        <Cookie className="mt-0.5 h-6 w-6 shrink-0 text-[#c28a3a]" />

        <div className="flex-1 text-[#d8c9bb]">
          <p className="mb-1 text-sm font-semibold text-[#f8efe3]">
            Usamos cookies
          </p>
          <p className="text-xs leading-5 text-[#b8a99a]">
            Utilizamos cookies para mejorar tu experiencia y analizar el tráfico
            del sitio de forma anónima. Consulta nuestra{" "}
            <Link
              href="/privacidad"
              className="font-semibold text-[#c28a3a] underline underline-offset-2 hover:text-[#d7a24a] transition-colors"
            >
              Política de Privacidad
            </Link>
            .
          </p>

          <div className="mt-4 flex items-center gap-2">
            <button
              id="cookie-accept-btn"
              onClick={accept}
              className="flex-1 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#271310] transition-all hover:bg-[#f3ede3] sm:flex-none"
            >
              Aceptar
            </button>
            <button
              id="cookie-dismiss-btn"
              onClick={dismiss}
              className="flex-1 border border-[#3a2a20] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#b8a99a] transition-all hover:border-[#5a3424] hover:text-[#d8c9bb] sm:flex-none"
            >
              Rechazar
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          id="cookie-close-btn"
          onClick={dismiss}
          aria-label="Cerrar aviso de cookies"
          className="shrink-0 rounded p-1 text-[#82766d] transition-colors hover:text-[#b8a99a]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
