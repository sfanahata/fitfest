"use client";
import { ReactNode } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '3xl';
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'white';
  color?: string;
}

export default function Logo({ size = 'md', className = '', showText = true, variant = 'default', color }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '3xl': 'w-60 h-60'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '3xl': 'text-6xl'
  };

  return (
    <div className={`flex items-center gap-0 -space-x-2 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} relative`}>
        <img 
          src="/teal-logo.svg" 
          alt="FitFest Logo" 
          className="w-full h-full"
          style={{}}
        />
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className={`font-bold ${textSizes[size]} text-fitfest-deep`}>
          fitfest
        </div>
      )}
    </div>
  );
}
