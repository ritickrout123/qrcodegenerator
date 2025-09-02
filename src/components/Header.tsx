import React from 'react';
import { QrCode, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="relative">
          <QrCode size={32} className="text-indigo-400" />
          <Zap size={16} className="text-yellow-400 absolute -top-1 -right-1" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          QR Generator Pro
        </h1>
      </div>
      <p className="text-gray-400 max-w-2xl mx-auto">
        Create intelligent QR codes with device-specific redirection. Perfect for apps, websites, and marketing campaigns.
      </p>
    </header>
  );
}