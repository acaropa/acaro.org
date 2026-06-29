import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Proyectos | ACARO OBC",
  description: "Explora las iniciativas productivas, técnicas y comunitarias que impulsa la Asociación Café Robusta OBC en Panamá.",
  openGraph: {
    title: "Proyectos | ACARO OBC",
    description: "Iniciativas productivas y de desarrollo del café robusta en Panamá.",
    url: "https://acaro.org/proyectos",
    siteName: "ACARO OBC",
    images: [{ url: "/assets/landing-hero-v2.jpg", width: 1200, height: 630 }],
    locale: "es_PA",
    type: "website",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
