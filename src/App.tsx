import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QRTypeSelector from './components/QRTypeSelector';
import QRInputForm from './components/QRInputForm';
import QRCodeDisplay from './components/QRCodeDisplay';
import { useQRGenerator } from './hooks/useQRGenerator';
import { QRFormData, QRCodeSettings } from './types/qr';
import { validateFormData } from './utils/validation';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900/20 to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <div className="max-w-6xl mx-auto">
          <QRTypeSelector 
            selectedType={formData.type} 
            onTypeSelect={handleTypeSelect} 
          />
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <QRInputForm 
                formData={formData} 
                onFormChange={handleFormChange} 
              />
              
              {error && (
                <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
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
              
              {loading && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-indigo-300 text-sm">Generating QR code...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-12 bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="text-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">1</span>
                </div>
                <p><strong>Generate</strong> your QR code with platform-specific URLs</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">2</span>
                </div>
                <p><strong>Scan</strong> the QR code with any device</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">3</span>
                </div>
                <p><strong>Redirect</strong> automatically to the right platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;