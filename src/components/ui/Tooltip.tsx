import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import { cn } from '../../utils/classNames';

export interface TooltipProps {
  content: React.ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  disabled?: boolean;
  className?: string;
  children: React.ReactElement;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = 'top',
  delay = 500,
  disabled = false,
  className,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({
        fallbackAxisSideDirection: 'start',
      }),
      shift({ padding: 8 }),
    ],
  });

  const hover = useHover(context, {
    move: false,
    delay: { open: delay, close: 100 },
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  if (disabled || !content) {
    return children;
  }

  const tooltipVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: placement === 'top' ? 5 : placement === 'bottom' ? -5 : 0,
      x: placement === 'left' ? 5 : placement === 'right' ? -5 : 0,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      x: 0,
    },
  };

  return (
    <>
      {React.cloneElement(children, {
        ref: refs.setReference,
        ...getReferenceProps(),
      })}

      <FloatingPortal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={refs.setFloating}
              style={floatingStyles}
              className="z-tooltip"
              variants={tooltipVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.15, ease: 'easeOut' }}
              {...getFloatingProps()}
            >
              <div
                className={cn(
                  'px-3 py-2 text-xs font-medium text-white rounded-lg shadow-xl max-w-xs',
                  'bg-gray-900/95 backdrop-blur-lg border border-gray-700/50',
                  'relative',
                  className
                )}
              >
                {/* Arrow */}
                <div
                  className={cn(
                    'absolute w-2 h-2 bg-gray-900/95 border rotate-45',
                    {
                      '-bottom-1 left-1/2 transform -translate-x-1/2 border-r-gray-700/50 border-b-gray-700/50 border-l-transparent border-t-transparent': placement === 'top',
                      '-top-1 left-1/2 transform -translate-x-1/2 border-l-gray-700/50 border-t-gray-700/50 border-r-transparent border-b-transparent': placement === 'bottom',
                      '-right-1 top-1/2 transform -translate-y-1/2 border-t-gray-700/50 border-r-gray-700/50 border-b-transparent border-l-transparent': placement === 'left',
                      '-left-1 top-1/2 transform -translate-y-1/2 border-b-gray-700/50 border-l-gray-700/50 border-t-transparent border-r-transparent': placement === 'right',
                    }
                  )}
                />
                
                <div className="relative z-10">
                  {typeof content === 'string' ? (
                    <p className="leading-tight">{content}</p>
                  ) : (
                    content
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </>
  );
};

export default Tooltip;
