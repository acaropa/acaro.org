import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CookieBanner } from '@/components/ui/CookieBanner';

export const metadata: Metadata = {
  metadataBase: new URL('https://acaro.org'),
  title: 'ACARO | Asociación Café Robusta OBC',
  description:
    'Portal institucional de la Asociación Café Robusta OBC, asociación dedicada al desarrollo del café robusta en Panamá.',
  alternates: {
    canonical: 'https://acaro.org',
  },
  openGraph: {
    title: 'ACARO | Asociación Café Robusta OBC',
    description:
      'Portal institucional de la Asociación Café Robusta OBC, asociación dedicada al desarrollo del café robusta en Panamá.',
    url: 'https://acaro.org',
    siteName: 'ACARO',
    images: [{ url: '/assets/landing-hero-v2.jpg', width: 1200, height: 630 }],
    locale: 'es_PA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ACARO | Asociación Café Robusta OBC',
    description:
      'Portal institucional de la Asociación Café Robusta OBC, asociación dedicada al desarrollo del café robusta en Panamá.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-background text-foreground antialiased font-sans" suppressHydrationWarning>
        {/* Analítica — Plausible (privacy-first, sin cookies de seguimiento) */}
        <Script
          defer
          data-domain="acaro.org"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
        <AuthProvider>{children}</AuthProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
