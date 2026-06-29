import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Productores | ACARO OBC",
  description: "Conoce a los productores de café robusta que forman la comunidad de la Asociación Café Robusta OBC en Panamá.",
  openGraph: {
    title: "Productores | ACARO OBC",
    description: "Los productores de café robusta que forman el corazón de la comunidad ACARO OBC.",
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
