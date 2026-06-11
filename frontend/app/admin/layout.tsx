import type { Metadata } from 'next';
import { AdminLayoutClient } from '@/components/layout/AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Administración | ACARO',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
