import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Animation delay utility
 */
export function getAnimationDelay(index: number, baseDelay = 100) {
  return { animationDelay: `${index * baseDelay}ms` };
}

/**
 * Get input field classes based on state
 */
export function getInputClasses(
  state: 'default' | 'success' | 'warning' | 'error' = 'default',
  className?: string
) {
  const baseClasses = 'input-field';
  const stateClasses = {
    default: '',
    success: 'input-field-success',
    warning: 'input-field-warning',
    error: 'input-field-error',
  };

  return cn(baseClasses, stateClasses[state], className);
}

/**
 * Get button variant classes
 */
export function getButtonClasses(
  variant: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'error' | 'icon' = 'primary',
  className?: string
) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    success: 'btn-success',
    warning: 'btn-warning',
    error: 'btn-error',
    icon: 'btn-icon',
  };

  return cn(variantClasses[variant], className);
}

/**
 * Get card variant classes
 */
export function getCardClasses(
  variant: 'default' | 'interactive' | 'glass' | 'glass-strong' = 'default',
  className?: string
) {
  const baseClasses = 'card';
  const variantClasses = {
    default: '',
    interactive: 'card-interactive',
    glass: 'card-glass',
    'glass-strong': 'card-glass-strong',
  };

  return cn(baseClasses, variant !== 'glass' && variant !== 'glass-strong' ? '' : '', variantClasses[variant], className);
}

/**
 * Get text gradient classes
 */
export function getTextGradientClasses(
  variant: 'primary' | 'success' | 'warning' | 'error' = 'primary',
  className?: string
) {
  const variantClasses = {
    primary: 'text-gradient',
    success: 'text-gradient-success',
    warning: 'text-gradient-warning',
    error: 'text-gradient-error',
  };

  return cn(variantClasses[variant], className);
}

/**
 * Get shadow glow classes
 */
export function getShadowGlowClasses(
  variant: 'primary' | 'success' | 'warning' | 'error' = 'primary',
  className?: string
) {
  const variantClasses = {
    primary: 'shadow-glow-primary',
    success: 'shadow-glow-success',
    warning: 'shadow-glow-warning',
    error: 'shadow-glow-error',
  };

  return cn(variantClasses[variant], className);
}

/**
 * Get responsive grid classes
 */
export function getResponsiveGridClasses(
  cols: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  },
  className?: string
) {
  const gridClasses = [];
  
  if (cols.sm) gridClasses.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) gridClasses.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) gridClasses.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) gridClasses.push(`xl:grid-cols-${cols.xl}`);

  return cn('grid', gridClasses, className);
}
