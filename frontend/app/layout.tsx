import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

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
    locale: 'es_PA',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'ACARO | Asociación Café Robusta OBC',
    description:
      'Portal institucional de la Asociación Café Robusta OBC, asociación dedicada al desarrollo del café robusta en Panamá.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-background text-foreground antialiased font-sans" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
