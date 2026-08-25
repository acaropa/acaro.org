import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CookieBanner } from '@/components/ui/CookieBanner';

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;

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
        {googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}', { anonymize_ip: true });
              `}
            </Script>
          </>
        )}
        <AuthProvider>{children}</AuthProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
