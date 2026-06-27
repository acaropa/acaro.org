'use client';

import { useEffect, useState } from 'react';
import { BookOpen, TrendingUp, ShieldCheck, GraduationCap, FileText } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { api } from '@/lib/api';
import { LibraryRecord, toLibraryDocument, LibraryDocument } from '@/lib/library';

type IconKey = 'pdf' | 'video' | 'doc' | 'link' | string;

const RESOURCE_ICONS: Record<IconKey, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  doc: FileText,
  video: TrendingUp,
  link: BookOpen,
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Agronomía': BookOpen,
  'Procesamiento': TrendingUp,
  'Mercados': TrendingUp,
  'Sostenibilidad': ShieldCheck,
  'Estándares OBC': GraduationCap,
};

function getIcon(doc: LibraryDocument) {
  return CATEGORY_ICONS[doc.category] || RESOURCE_ICONS[doc.resourceType] || BookOpen;
}

const ACTION_LABEL: Record<string, string> = {
  pdf: 'Descargar PDF',
  doc: 'Abrir Documento',
  video: 'Ver Recurso',
  link: 'Leer Más',
};

export function LibraryPreview() {
  const [items, setItems] = useState<LibraryDocument[]>([]);

  useEffect(() => {
    api.get<LibraryRecord[]>('/biblioteca')
      .then(data => setItems(data.slice(0, 4).map(toLibraryDocument)))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
      {items.map((item, index) => {
        const Icon = getIcon(item);
        return (
          <ScrollReveal key={item.id} delay={index * 80}>
            <div className="group border border-[#d8cabb]/40 bg-[#eeeeea] p-8 transition-all duration-500 hover:bg-white hover:shadow-xl">
              <Icon className="mb-6 h-9 w-9 text-[#1b6d24]" />
              <h5 className="mb-2 font-serif text-lg font-semibold text-[#271310]">{item.title}</h5>
              <p className="mb-6 text-sm leading-6 text-[#504442]">{item.description}</p>
              <a
                href={item.link || '/biblioteca'}
                target={item.link ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="text-xs font-bold uppercase tracking-widest text-[#271310] group-hover:underline"
              >
                {ACTION_LABEL[item.resourceType] || 'Ver Recurso'}
              </a>
            </div>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
