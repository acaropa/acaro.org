import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'normal' | 'white' | 'chocolate' | 'color';
  className?: string;
  showText?: boolean;
}

export function Logo({ variant = 'normal', className, showText = true }: LogoProps) {
  // Select which logo variant to use based on the background
  const logoSrc = variant === 'white' 
    ? '/assets/logos/logo2.png' // Assuming logo2 is a light variant or we fallback to CSS inversion if needed
    : '/assets/logos/logo1.png';

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("relative shrink-0 flex items-center justify-center", 
        variant === 'white' && 'brightness-0 invert' // Simple trick to make it white if the image is dark
      )}>
        <Image 
          src="/assets/logos/logo1.png"
          alt="Asociación Café Robusta OBC Logo"
          width={48}
          height={48}
          className="object-contain w-10 h-10 md:w-12 md:h-12"
          priority
        />
      </div>
      {showText && (
        <span className={cn(
          "font-bold text-lg md:text-xl tracking-tight leading-none",
          variant === 'white' ? 'text-white' : 'text-primary dark:text-foreground'
        )}>
          Asociación Café<br />Robusta OBC
        </span>
      )}
    </div>
  );
}
