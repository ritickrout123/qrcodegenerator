import React from 'react';
import toast, { Toaster, Toast as HotToast, resolveValue } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/classNames';

// Custom toast components
const ToastIcon = ({ type }: { type: string }) => {
  const iconClasses = 'w-5 h-5 flex-shrink-0';
  
  switch (type) {
    case 'success':
      return <CheckCircle className={cn(iconClasses, 'text-green-400')} />;
    case 'error':
      return <AlertCircle className={cn(iconClasses, 'text-red-400')} />;
    case 'warning':
      return <AlertTriangle className={cn(iconClasses, 'text-yellow-400')} />;
    case 'info':
      return <Info className={cn(iconClasses, 'text-blue-400')} />;
    default:
      return <Info className={cn(iconClasses, 'text-gray-400')} />;
  }
};

const CustomToast = ({ t }: { t: HotToast }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ 
        opacity: t.visible ? 1 : 0, 
        x: t.visible ? 0 : 100,
        scale: t.visible ? 1 : 0.95
      }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl max-w-md',
        'bg-gray-900/90 border-gray-700/50',
        t.type === 'success' && 'border-green-500/30 bg-green-500/5',
        t.type === 'error' && 'border-red-500/30 bg-red-500/5',
        (t.type as string) === 'warning' && 'border-yellow-500/30 bg-yellow-500/5',
        (t.type as string) === 'info' && 'border-blue-500/30 bg-blue-500/5'
      )}
    >
      <ToastIcon type={t.type} />
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white leading-tight">
          {resolveValue(t.message, t)}
        </div>
      </div>
      
      <button
        onClick={() => toast.dismiss(t.id)}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors duration-200 text-gray-400 hover:text-gray-300"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

// Toast provider component
export const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerClassName="z-toast"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          margin: 0,
        },
        success: {
          duration: 3000,
        },
        error: {
          duration: 5000,
        },
      }}
    >
      {(t) => <CustomToast t={t} />}
    </Toaster>
  );
};

// Enhanced toast utilities
export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },
  error: (message: string) => {
    toast.error(message);
  },
  warning: (message: string) => {
    toast(message, { icon: '⚠️' });
  },
  info: (message: string) => {
    toast(message, { icon: 'ℹ️' });
  },
  loading: (message: string) => {
    return toast.loading(message);
  },
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, msgs);
  },
};

export default showToast;
