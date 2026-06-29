import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Encuestas | ACARO OBC",
  description: "Participa en las encuestas activas de la Asociación Café Robusta OBC y contribuye al desarrollo de la comunidad.",
  openGraph: {
    title: "Encuestas | ACARO OBC",
    description: "Participa en las encuestas activas de ACARO OBC y contribuye al desarrollo de la comunidad cafetalera.",
    url: "https://acaro.org/encuestas",
    siteName: "ACARO OBC",
    images: [{ url: "/assets/coffee-beans-texture.png", width: 1200, height: 630 }],
    locale: "es_PA",
    type: "website",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
