import React from 'react';
import { Link, Smartphone, Wifi, Phone, QrCode, Globe } from 'lucide-react';
import { QRType } from '../types/qr';

interface QRTypeSelectorProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
}

const qrTypes: QRType[] = [
  {
    id: 'link',
    name: 'Link',
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
    name: 'QrdyLink',
    description: 'Custom short link',
    icon: 'QrCode'
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    description: 'Wi-Fi network credentials',
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

export default function QRTypeSelector({ selectedType, onTypeSelect }: QRTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      {qrTypes.map((type) => {
        const IconComponent = iconMap[type.icon as keyof typeof iconMap];
        const isSelected = selectedType === type.id;
        
        return (
          <button
            key={type.id}
            onClick={() => onTypeSelect(type.id)}
            className={`
              p-4 rounded-xl border-2 transition-all duration-200 text-left
              ${isSelected 
                ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600 hover:bg-gray-800'
              }
            `}
          >
            <div className="flex items-center gap-3 mb-2">
              <IconComponent size={20} className={isSelected ? 'text-indigo-400' : 'text-gray-400'} />
              <span className="font-semibold">{type.name}</span>
            </div>
            <p className="text-sm text-gray-400">{type.description}</p>
          </button>
        );
      })}
    </div>
  );
}