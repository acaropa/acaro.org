import type { Metadata } from 'next';
import { Inter, Montserrat, Beth_Ellen } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans-source' });
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const bethEllen = Beth_Ellen({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-handwritten-source',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://acaro.org'),
  title: 'ACARO | Asociación Café Robusta OBC',
  description:
    'Portal institucional de la Asociación Café Robusta OBC, organización dedicada al desarrollo del café robusta en Panamá.',
  alternates: {
    canonical: 'https://acaro.org',
  },
  openGraph: {
    title: 'ACARO | Asociación Café Robusta OBC',
    description:
      'Portal institucional de la Asociación Café Robusta OBC, organización dedicada al desarrollo del café robusta en Panamá.',
    url: 'https://acaro.org',
    siteName: 'ACARO',
    locale: 'es_PA',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'ACARO | Asociación Café Robusta OBC',
    description:
      'Portal institucional de la Asociación Café Robusta OBC, organización dedicada al desarrollo del café robusta en Panamá.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable} ${bethEllen.variable} h-full`} suppressHydrationWarning>
      <body className="h-full bg-background text-foreground antialiased font-sans" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
