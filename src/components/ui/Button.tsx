import React, { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn, getButtonClasses } from '../../utils/classNames';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'error' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
  animate?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      fullWidth = false,
      rounded = false,
      animate = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const motionProps = animate
      ? {
          whileHover: { scale: disabled || loading ? 1 : 1.02 },
          whileTap: { scale: disabled || loading ? 1 : 0.98 },
          transition: { duration: 0.1 },
        }
      : {};

    const buttonContent = (
      <>
        {loading && (
          <motion.div
            className="mr-2"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </motion.div>
        )}
        
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        
        <span className="flex-1">
          {loading ? (loadingText || 'Loading...') : children}
        </span>
        
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </>
    );

    return (
      <motion.button
        ref={ref}
        className={cn(
          getButtonClasses(variant),
          sizeClasses[size],
          {
            'w-full': fullWidth,
            'rounded-full': rounded,
            'opacity-50 cursor-not-allowed': disabled || loading,
            'flex items-center justify-center': true,
          },
          className
        )}
        disabled={disabled || loading}
        {...motionProps}
        {...props}
      >
        {buttonContent}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
