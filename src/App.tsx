import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Header from './components/Header';
import QRTypeSelector from './components/QRTypeSelector';
import QRInputForm from './components/QRInputForm';
import QRCodeDisplay from './components/QRCodeDisplay';
import { useQRGenerator } from './hooks/useQRGenerator';
import { QRFormData, QRCodeSettings } from './types/qr';
import { validateFormData } from './utils/validation';
import { ToastProvider } from './components/ui/Toast';

function App() {
  const [formData, setFormData] = useState<QRFormData>({
    type: 'link',
    urls: {
      ios: '',
      android: '',
      web: ''
    }
  });

  const [settings, setSettings] = useState<QRCodeSettings>({
    size: 256,
    bgColor: '#ffffff',
    fgColor: '#000000',
    errorCorrectionLevel: 'M'
  });

  const { qrData, shortId, loading, error, generateQR, clearQR } = useQRGenerator();

  const handleTypeSelect = (type: string) => {
    setFormData({ ...formData, type: type as any });
    clearQR();
  };

  const handleFormChange = (newFormData: QRFormData) => {
    setFormData(newFormData);
  };

  const handleGenerate = () => {
    // Validate form data before generating QR
    const validation = validateFormData(formData);
    if (!validation.isValid) {
      console.warn('Form validation failed:', validation.error);
      return;
    }

    generateQR(formData);
  };

  // Auto-generate QR when form data changes and is valid
  useEffect(() => {
    const timer = setTimeout(() => {
      const validation = validateFormData(formData);
      if (validation.isValid) {
        generateQR(formData);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData]);

  return (
    <>
      <ToastProvider />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-x-hidden">
        {/* Enhanced Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div 
            className="absolute top-40 right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -30, 0],
              y: [0, 40, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2
            }}
          />
          <motion.div 
            className="absolute bottom-20 left-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.6, 0.4],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 4
            }}
          />
          
          {/* Additional floating elements */}
          <motion.div 
            className="absolute top-1/2 left-20 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1
            }}
          />
          <motion.div 
            className="absolute bottom-40 right-1/4 w-48 h-48 bg-yellow-500/8 rounded-full blur-3xl"
            animate={{
              scale: [0.8, 1.1, 0.8],
              rotate: [0, -90, 0]
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 3
            }}
          />
        </div>
        
        <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 custom-scrollbar">
          <Header />
          
          <div className="max-w-7xl mx-auto">
            <QRTypeSelector 
              selectedType={formData.type} 
              onTypeSelect={handleTypeSelect} 
            />
            
            <div className="grid xl:grid-cols-2 gap-8 mb-12">
              <div className="space-y-6">
                <QRInputForm 
                  formData={formData} 
                  onFormChange={handleFormChange} 
                />
                
                {/* Enhanced Error Display */}
                {error && (
                  <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm animate-slide-in">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-red-500/20 rounded-full">
                        <AlertTriangle size={16} className="text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-red-300 font-semibold mb-1">Generation Error</h4>
                        <p className="text-red-400 text-sm leading-relaxed">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Enhanced Loading State */}
                {loading && (
                  <div className="p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl backdrop-blur-sm animate-slide-in">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-8 h-8 border-3 border-transparent border-t-indigo-400 rounded-full animate-spin" style={{animationDuration: '0.8s', animationDirection: 'reverse'}}></div>
                      </div>
                      <div>
                        <h4 className="text-indigo-300 font-semibold mb-1">Generating QR Code</h4>
                        <p className="text-indigo-400 text-sm">Creating your intelligent QR code...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <QRCodeDisplay 
                  qrData={qrData}
                  settings={settings}
                  onSettingsChange={setSettings}
                  shortId={shortId}
                />
              </div>
            </div>
            
            {/* Enhanced How It Works Section */}
            <div className="card p-8 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">How It Works</h3>
                <p className="text-gray-400">Simple steps to create intelligent QR codes</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                      <span className="text-white font-bold text-xl">1</span>
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur group-hover:blur-lg transition-all duration-300 -z-10"></div>
                  </div>
                  <h4 className="text-white font-semibold text-lg mb-2">Choose Type</h4>
                  <p className="text-slate-300 leading-relaxed">Select from multiple QR types including smart links, WiFi, phone numbers, and more.</p>
                </div>
                
                <div className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                      <span className="text-white font-bold text-xl">2</span>
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur group-hover:blur-lg transition-all duration-300 -z-10"></div>
                  </div>
                  <h4 className="text-white font-semibold text-lg mb-2">Configure</h4>
                  <p className="text-slate-300 leading-relaxed">Enter your URLs, WiFi credentials, or phone numbers with real-time validation.</p>
                </div>
                
                <div className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                      <span className="text-white font-bold text-xl">3</span>
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-2xl blur group-hover:blur-lg transition-all duration-300 -z-10"></div>
                  </div>
                  <h4 className="text-white font-semibold text-lg mb-2">Share</h4>
                  <p className="text-slate-300 leading-relaxed">Download or share your QR code with automatic device detection and platform routing.</p>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-gray-700/50">
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Device Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <span>Secure Links</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    <span>Analytics Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                    <span>Customizable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-slate-700/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
              Built with ❤️ using React, TypeScript, and modern web technologies
            </p>
          </div>
        </footer>
        </div>
      </div>
    </>
  );
}

export default App;