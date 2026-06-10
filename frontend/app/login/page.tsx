'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5 dark:opacity-10 pointer-events-none mix-blend-overlay"></div>
      
      <div className="w-full max-w-md px-6 relative z-10">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al portal
        </Link>
        
        <Card className="border-border/60 shadow-xl bg-surface/95 backdrop-blur">
          <CardContent className="pt-10 pb-8 px-8">
            <div className="text-center mb-8 flex flex-col items-center">
              <Logo className="mb-4" />
              <h1 className="text-2xl font-bold text-primary">Acceso Interno</h1>
              <p className="mt-2 text-sm text-muted">Ingresa tus credenciales para acceder al sistema de gestión.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Correo electrónico</label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                  placeholder="usuario@asociacioncaferobusta.org" 
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Contraseña</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required
                  placeholder="••••••••" 
                  className="bg-background/50"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-md px-4 py-3">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full h-11 text-base shadow-md">
                {loading ? 'Ingresando...' : 'Ingresar al Dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted mt-8">
          © {new Date().getFullYear()} Asociación Café Robusta OBC.<br />Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
