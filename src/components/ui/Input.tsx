import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, Eye, EyeOff } from 'lucide-react';
import { cn, getInputClasses } from '../../utils/classNames';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
  success?: string;
  warning?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  state?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      description,
      error,
      success,
      warning,
      leftIcon,
      rightIcon,
      state = 'default',
      size = 'md',
      fullWidth = true,
      showPasswordToggle = false,
      className,
      type: initialType = 'text',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [type, setType] = React.useState(initialType);

    React.useEffect(() => {
      if (showPasswordToggle && initialType === 'password') {
        setType(showPassword ? 'text' : 'password');
      } else {
        setType(initialType);
      }
    }, [showPassword, showPasswordToggle, initialType]);

    // Decide state based on validation
    const currentState = error
      ? 'error'
      : warning
      ? 'warning'
      : success
      ? 'success'
      : state;

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };

    const validationMessage = error || warning || success;
    const validationIcon = error ? (
      <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
    ) : warning ? (
      <Info size={14} className="text-yellow-400 flex-shrink-0" />
    ) : success ? (
      <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
    ) : null;

    const validationBg = error
      ? 'bg-red-500/10 border-red-500/20'
      : warning
      ? 'bg-yellow-500/10 border-yellow-500/20'
      : success
      ? 'bg-green-500/10 border-green-500/20'
      : '';

    const togglePassword = () => setShowPassword((prev) => !prev);

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {typeof label === 'string' ? (
              <>
                {label}
                {props.required && <span className="text-red-400 ml-1">*</span>}
              </>
            ) : (
              <div className="flex items-center gap-2">
                {label}
                {props.required && <span className="text-red-400 ml-1">*</span>}
              </div>
            )}
          </label>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
        )}

        {/* Input Wrapper */}
        <div className="relative">
          {/* Left Icon */}
          {/* {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )} */}

          {/* Input */}
          <input
            ref={ref}
            type={type}
            className={cn(
              getInputClasses(currentState),
              sizeClasses[size],
              {
                'pl-10': leftIcon, // padding if leftIcon exists
                'pr-10': rightIcon || showPasswordToggle, // padding if rightIcon or password toggle
                'w-full': fullWidth,
              },
              className
            )}
            {...props}
          />

          {/* Right Icon / Password Toggle */}
          {(rightIcon || showPasswordToggle) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPasswordToggle && initialType === 'password' ? (
                <button
                  type="button"
                  onClick={togglePassword}
                  className="text-gray-400 hover:text-gray-300 focus:outline-none transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              ) : (
                <div className="text-gray-400">{rightIcon}</div>
              )}
            </div>
          )}
        </div>

        {/* Validation Message */}
        {validationMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg border backdrop-blur-sm animate-slide-in',
              validationBg
            )}
          >
            {validationIcon}
            <span
              className={cn(
                'text-xs leading-relaxed',
                error && 'text-red-400',
                warning && 'text-yellow-400',
                success && 'text-green-400'
              )}
            >
              {validationMessage}
            </span>
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
