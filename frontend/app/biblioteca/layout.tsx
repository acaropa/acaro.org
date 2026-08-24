import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Biblioteca | ACARO OBC",
  description: "Repositorio técnico con documentos, guías y recursos para productores, técnicos e investigadores del café robusta.",
  openGraph: {
    title: "Biblioteca técnica | ACARO OBC",
    description: "Documentos técnicos, guías y recursos para el desarrollo del café robusta en Panamá.",
    url: "https://acaro.org/biblioteca",
    siteName: "ACARO OBC",
    images: [{ url: "/assets/library-hero-v2.png", width: 1200, height: 630 }],
    locale: "es_PA",
    type: "website",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
