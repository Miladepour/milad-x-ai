'use client';

import Link from 'next/link';
import { useRef, ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLSpanElement>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 250, damping: 20 });
  const y = useSpring(rawY, { stiffness: 250, damping: 20 });

  const handleMouseMove = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement | HTMLSpanElement>
  ) => {
    const el = buttonRef.current ?? linkRef.current ?? anchorRef.current;
    const rect = el?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    rawX.set(dx * 0.3);
    rawY.set(dy * 0.3);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const classes = cn(
    'inline-block font-mono tracking-widest uppercase transition-colors duration-200 cursor-pointer',
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  if (href) {
    const isExternal = href.startsWith('http');
    if (isExternal) {
      return (
        <motion.a
          ref={anchorRef}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ x, y, borderRadius: '2px' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={classes}
        >
          {children}
        </motion.a>
      );
    }

    return (
      <Link href={href} className="inline-block">
        <motion.span
          ref={linkRef}
          style={{ x, y, borderRadius: '2px', display: 'inline-block' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={classes}
        >
          {children}
        </motion.span>
      </Link>
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      style={{ x, y, borderRadius: '2px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={classes}
    >
      {children}
    </motion.button>
  );
}
