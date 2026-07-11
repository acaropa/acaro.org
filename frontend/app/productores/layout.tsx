import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gente del Robusta | ACARO OBC",
  description: "Conoce a las personas en la cadena de valor del café robusta que forman la comunidad de la Asociación Café Robusta OBC en Panamá.",
  openGraph: {
    title: "Gente del Robusta | ACARO OBC",
    description: "Las personas en la cadena de valor del café robusta que forman el corazón de la comunidad ACARO OBC.",
    url: "https://acaro.org/productores",
    siteName: "ACARO OBC",
    images: [{ url: "/assets/landing-hero-v2.jpg", width: 1200, height: 630 }],
    locale: "es_PA",
    type: "website",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
