'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, BookOpen, Newspaper, Users, Activity } from 'lucide-react';
import { mockProjects } from '@/data/mock-projects';
import { mockNews } from '@/data/mock-news';
import { mockDocuments } from '@/data/mock-documents';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Proyectos Activos', value: mockProjects.filter(p => p.status === 'Activo').length, icon: FolderKanban, color: 'text-accent' },
    { label: 'Documentos', value: mockDocuments.length, icon: BookOpen, color: 'text-brand-green' },
    { label: 'Noticias Publicadas', value: mockNews.length, icon: Newspaper, color: 'text-primary' },
    { label: 'Usuarios', value: 4, icon: Users, color: 'text-muted' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Panel General</h1>
        <p className="mt-2 text-sm text-muted">
          Resumen de actividad de la Asociación Café Robusta OBC.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardContent className="p-6 flex items-center">
              <div className={`p-4 rounded-full bg-surface ${stat.color} bg-opacity-20 mr-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Activity className="w-5 h-5 mr-2 text-accent" /> Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockNews.slice(0, 3).map((news, i) => (
                <div key={i} className="flex items-start pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-accent mr-4 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{news.title}</p>
                    <p className="text-xs text-muted mt-1">{news.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FolderKanban className="w-5 h-5 mr-2 text-brand-green" /> Estado de Proyectos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProjects.slice(0, 4).map((project, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{project.title}</p>
                    <p className="text-xs text-muted">{project.category}</p>
                  </div>
                  <Badge variant={project.status === 'Activo' ? 'success' : project.status === 'Planificación' ? 'secondary' : 'default'}>
                    {project.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
