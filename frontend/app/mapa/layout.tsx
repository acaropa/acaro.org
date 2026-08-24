import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mapa territorial | ACARO OBC",
  description: "Mapa de actores vinculados a la cadena de valor del café robusta en Panamá.",
  openGraph: {
    title: "Mapa territorial | ACARO OBC",
    description: "Consulta la presencia territorial de actores de la cadena de valor del café robusta.",
    url: "https://acaro.org/mapa",
    siteName: "ACARO OBC",
    images: [{ url: "/assets/landing-hero-v2.jpg", width: 1200, height: 630 }],
    locale: "es_PA",
    type: "website",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
