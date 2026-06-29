import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Noticias | ACARO OBC",
  description: "Mantente al día con los avances institucionales, alianzas y eventos de la Asociación Café Robusta OBC.",
  openGraph: {
    title: "Noticias y Comunicados | ACARO OBC",
    description: "Avances institucionales, alianzas y eventos de la comunidad cafetalera de ACARO OBC.",
    url: "https://acaro.org/noticias",
    siteName: "ACARO OBC",
    images: [{ url: "/assets/landing-hero-v2.jpg", width: 1200, height: 630 }],
    locale: "es_PA",
    type: "website",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
