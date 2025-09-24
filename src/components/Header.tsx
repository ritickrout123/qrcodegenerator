import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Sparkles, Shield, Smartphone, Globe, Star } from 'lucide-react';
import { cn, getTextGradientClasses } from '../utils/classNames';
import Tooltip from './ui/Tooltip';

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

const iconBounceVariants = {
  animate: {
    y: [0, -10, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut'
    }
  }
};

export default function Header() {
  return (
    <motion.header 
      className="text-center mb-16 relative"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute -top-20 -right-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2], 
            opacity: [0.5, 0.3, 0.5] 
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
      </div>

      <motion.div 
        className="flex items-center justify-center gap-6 mb-8"
        variants={itemVariants}
      >
        <div className="relative group">
          {/* Glow effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur-xl opacity-50"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          
          {/* Icon container */}
          <motion.div 
            className="relative glass-morphism-strong p-6 rounded-3xl border border-white/20 group-hover:border-white/30 transition-all duration-300"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
            >
              <QrCode size={48} className="text-indigo-400 drop-shadow-lg" />
            </motion.div>
            
            {/* Floating sparkle */}
            <motion.div
              variants={iconBounceVariants}
              animate="animate"
              className="absolute -top-3 -right-3"
            >
              <Sparkles size={20} className="text-yellow-400 filter drop-shadow-sm" />
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          className="text-left"
          variants={itemVariants}
        >
          <motion.h1 
            className={cn(
              "text-5xl md:text-6xl lg:text-7xl font-bold mb-2 text-shadow-lg",
              getTextGradientClasses('primary')
            )}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{ backgroundSize: '200% 200%' }}
          >
            QR Generator Pro
          </motion.h1>
          
          <motion.div 
            className="flex items-center gap-2 text-sm"
            variants={itemVariants}
          >
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-sm">
              <Shield size={14} className="text-indigo-400" />
              <span className="text-indigo-300 font-medium">Secure & Smart</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 backdrop-blur-sm">
              <Star size={14} className="text-green-400" />
              <span className="text-green-300 font-medium">Pro Version</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="max-w-4xl mx-auto"
        variants={itemVariants}
      >
        <motion.p 
          className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed font-light"
          variants={itemVariants}
        >
          Create{' '}
          <span className="text-gradient font-medium">intelligent QR codes</span>{' '}
          with device-specific redirection, analytics, and advanced customization.
          <br className="hidden md:block" />
          Perfect for modern apps, websites, and marketing campaigns.
        </motion.p>
        
        <motion.div 
          className="flex flex-wrap items-center justify-center gap-6 text-sm"
          variants={itemVariants}
        >
          <Tooltip content="Works seamlessly across iOS, Android, and web platforms">
            <motion.div 
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-morphism border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Smartphone size={18} className="text-indigo-400" />
              <span className="text-gray-300 font-medium">Multi-Platform</span>
            </motion.div>
          </Tooltip>
          
          <Tooltip content="End-to-end encryption and secure link generation">
            <motion.div 
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-morphism border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield size={18} className="text-green-400" />
              <span className="text-gray-300 font-medium">Secure Links</span>
            </motion.div>
          </Tooltip>
          
          <Tooltip content="Global CDN delivery for fast QR code access worldwide">
            <motion.div 
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-morphism border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe size={18} className="text-purple-400" />
              <span className="text-gray-300 font-medium">Global CDN</span>
            </motion.div>
          </Tooltip>
        </motion.div>
      </motion.div>
      
      {/* Enhanced decorative elements */}
      <motion.div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent pointer-events-none"
        animate={{
          height: [128, 160, 128],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      <motion.div
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent pointer-events-none"
        animate={{
          width: [256, 320, 256],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1
        }}
      />
    </motion.header>
  );
}
