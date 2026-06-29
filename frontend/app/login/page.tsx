'use client';

import { AppIcon } from "@/components/ui/AppIcon"

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // rememberMe logic could be added here if supported by AuthContext
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing-typography bg-surface text-foreground antialiased min-h-screen flex selection:bg-accent/20 selection:text-primary">
      {/* Left Panel: Cover Image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-primary">
        {/* Warm ambient overlay */}
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply z-10 transition-opacity duration-1000"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#120c08]/80 to-transparent z-10"></div>
        <img 
          alt="Granos de café robusta en costal" 
          className="absolute inset-0 w-full h-full object-cover z-0 transform hover:scale-105 transition-transform duration-[10s] ease-out" 
          src="/assets/login-bg-v2.jpg"
        />
        
        {/* Back button top left */}
        <div className="absolute top-10 left-12 z-30">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-white hover:text-white transition-all bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 hover:bg-black/60 shadow-lg">
            <AppIcon name="arrow_back" className="text-[16px]" />
            <span>Volver al portal</span>
          </Link>
        </div>
        <div className="absolute bottom-12 left-12 z-20 max-w-md">
          <h2 className="text-4xl font-serif font-bold text-[#fdf9f4] mb-4 drop-shadow-lg">Cultivando excelencia.</h2>
          <p className="text-lg text-[#fdf9f4]/90 drop-shadow">Plataforma interna para la gestión integral de nuestra cadena productiva.</p>
        </div>
      </div>
      
      {/* Right Panel: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-hidden bg-[#fdf9f4]">
        {/* Logo */}
        <div className="absolute top-6 left-6 md:top-10 md:left-10 z-30">
          <Logo className="scale-90 origin-left" />
        </div>
        
        {/* Mobile back button */}
        <Link href="/" className="md:hidden absolute top-6 right-6 z-30 flex items-center justify-center bg-white shadow-sm border border-outline-variant/20 rounded-full p-2 text-muted hover:text-primary transition-colors">
          <AppIcon name="close" className="text-[18px]" />
        </Link>
        
        {/* Subtle decorative element (Glassmorphism blur blob) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d7a24a]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#26170c]/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
        
        <div className="w-full max-w-md flex flex-col relative z-20">
          {/* Header Identity */}
          <div className="flex flex-col items-center text-center gap-6 mb-12 mt-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-[#120c08] mb-2">Acceso Institucional</h1>
              <p className="text-sm text-[#4f453f]">Ingresa tus credenciales para acceder al sistema.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <input 
                  type="email" 
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block px-4 pb-2.5 pt-6 w-full text-sm text-[#120c08] bg-[#efeeeb] hover:bg-[#e9e8e5] rounded-t-md border-0 border-b border-[#81756f] appearance-none focus:outline-none focus:ring-0 focus:border-[#26170c] focus:bg-[#e9e8e5] peer transition-colors" 
                  placeholder=" " 
                  required
                />
                <label 
                  htmlFor="email" 
                  className="absolute text-[15px] text-[#504442] duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text font-medium"
                >
                  Correo electrónico
                </label>
              </div>

              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block px-4 pb-2.5 pt-6 w-full text-sm text-[#120c08] bg-[#efeeeb] hover:bg-[#e9e8e5] rounded-t-md border-0 border-b border-[#81756f] appearance-none focus:outline-none focus:ring-0 focus:border-[#26170c] focus:bg-[#e9e8e5] peer transition-colors pr-12" 
                  placeholder=" " 
                  required
                />
                <label 
                  htmlFor="password" 
                  className="absolute text-[15px] text-[#504442] duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text font-medium"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#504442] hover:text-[#26170c] transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 border-[#81756f] rounded text-[#26170c] focus:ring-[#26170c] cursor-pointer"
                  />
                </div>
                <span className="text-sm text-[#4f453f] group-hover:text-[#120c08] transition-colors">Recordarme</span>
              </label>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 mt-4">
                <AppIcon name="error" className="text-[18px]" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 mt-6 bg-[#26170c] hover:bg-[#120c08] text-[#fdf9f4] font-semibold rounded-md text-base shadow-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#81756f] mt-16">
            © {new Date().getFullYear()} Asociación Café Robusta OBC.<br />Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
