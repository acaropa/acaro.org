import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contacto | ACARO OBC",
  description: "Comunícate con el equipo de la Asociación Café Robusta OBC para consultas sobre productores, proyectos y alianzas.",
  openGraph: {
    title: "Contacto | ACARO OBC",
    description: "Escríbenos. El equipo de ACARO OBC responde consultas sobre membresía, proyectos y alianzas.",
    url: "https://acaro.org/contacto",
    siteName: "ACARO OBC",
    images: [{ url: "/assets/landing-hero-v2.jpg", width: 1200, height: 630 }],
    locale: "es_PA",
    type: "website",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
