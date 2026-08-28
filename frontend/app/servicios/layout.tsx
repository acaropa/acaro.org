import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Servicios | ACARO OBC",
  description: "Servicios de acompañamiento técnico y comercial para productores, fincas y aliados del café robusta.",
  openGraph: {
    title: "Servicios | ACARO OBC",
    description: "Acompañamiento técnico, café, plantines e insumos vinculados al café robusta.",
    url: "https://acaro.org/servicios",
    siteName: "ACARO OBC",
    images: [{ url: "/assets/servicios-hero.jpg", width: 1200, height: 630 }],
    locale: "es_PA",
    type: "website",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
