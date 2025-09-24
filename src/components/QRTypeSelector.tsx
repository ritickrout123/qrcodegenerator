import React from 'react';
import { Link, Smartphone, Wifi, Phone, QrCode, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { QRType } from '../types/qr';

interface QRTypeSelectorProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
}

const qrTypes: QRType[] = [
  {
    id: 'link',
    name: 'Smart Link',
    description: 'Multi-platform URL with device detection',
    icon: 'Link'
  },
  {
    id: 'appstore',
    name: 'App Store',
    description: 'Direct link to iOS App Store',
    icon: 'Smartphone'
  },
  {
    id: 'qrdylink',
    name: 'Short Link',
    description: 'Custom branded short URL',
    icon: 'QrCode'
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    description: 'Share network credentials instantly',
    icon: 'Wifi'
  },
  {
    id: 'phone',
    name: 'Phone',
    description: 'Click-to-call phone number',
    icon: 'Phone'
  }
];

const iconMap = {
  Link,
  Smartphone,
  QrCode,
  Wifi,
  Phone,
  Globe
};

const colorMap = {
  link: 'from-blue-500 to-indigo-500',
  appstore: 'from-gray-600 to-gray-800',
  qrdylink: 'from-purple-500 to-indigo-500',
  wifi: 'from-green-500 to-teal-500',
  phone: 'from-orange-500 to-red-500'
};

export default function QRTypeSelector({ selectedType, onTypeSelect }: QRTypeSelectorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">1</span>
        </div>
        <h2 className="text-xl font-semibold text-white">Choose QR Type</h2>
        <Sparkles size={16} className="text-yellow-400 animate-bounce-subtle" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {qrTypes.map((type, index) => {
          const IconComponent = iconMap[type.icon as keyof typeof iconMap];
          const isSelected = selectedType === type.id;
          const gradientClass = colorMap[type.id as keyof typeof colorMap];
          
          return (
            <button
              key={type.id}
              onClick={() => onTypeSelect(type.id)}
              className={`
                group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden
                transform hover:-translate-y-1 hover:shadow-2xl
                animate-scale-in
                ${isSelected 
                  ? 'border-indigo-400 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 shadow-glow bg-slate-700/80' 
                  : 'border-slate-600/60 bg-slate-800/80 hover:border-slate-500/60 hover:bg-slate-700/80'
                }
              `}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Background gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                </div>
              )}
              
              {/* Icon container */}
              <div className={`
                relative mb-4 p-3 rounded-xl transition-all duration-300
                ${isSelected ? 'bg-indigo-500/30' : 'bg-slate-700/60 group-hover:bg-slate-600/60'}
              `}>
                <IconComponent 
                  size={24} 
                  className={`
                    transition-all duration-300 transform group-hover:scale-110
                    ${isSelected ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'}
                  `} 
                />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`
                    font-semibold transition-colors duration-300
                    ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}
                  `}>
                    {type.name}
                  </span>
                  {isSelected && (
                    <ArrowRight size={14} className="text-indigo-400 animate-pulse" />
                  )}
                </div>
                <p className={`
                  text-xs leading-relaxed transition-colors duration-300
                  ${isSelected ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-300'}
                `}>
                  {type.description}
                </p>
              </div>
              
              {/* Hover effect line */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 group-hover:w-full"></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
