'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const sizeClasses = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm',
};

const variantClasses = {
  primary:
    'bg-orange text-background border-2 border-orange hover:bg-orange-dim hover:border-orange-dim',
  outline:
    'bg-transparent text-cream border-2 border-cream hover:border-orange hover:text-orange',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  href,
  onClick,
  className = '',
  type = 'button',
}: ButtonProps) {
  const classes = cn(
    'inline-block font-mono tracking-widest uppercase transition-colors duration-200 cursor-pointer rounded-[2px]',
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  if (href) {
    const isExternal = href.startsWith('http');
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
