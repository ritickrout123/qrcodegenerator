import React, { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn, getCardClasses, getAnimationDelay } from '../../utils/classNames';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'interactive' | 'glass' | 'glass-strong';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  animationDelay?: number;
  hover?: boolean;
  children?: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'lg',
      animate = true,
      animationDelay = 0,
      hover = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    const motionProps = animate
      ? {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, delay: animationDelay * 0.1 },
          ...(hover && {
            whileHover: { y: -4, scale: 1.02 },
            transition: { duration: 0.2 },
          }),
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          getCardClasses(variant),
          paddingClasses[padding],
          hover && 'cursor-pointer',
          className
        )}
        style={getAnimationDelay(animationDelay)}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
