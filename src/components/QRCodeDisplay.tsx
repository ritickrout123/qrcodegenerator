import React from 'react';
import QRCode from 'react-qr-code';
import { Download, Copy, Check, AlertTriangle, Settings, Palette, QrCode as QrCodeIcon, Sparkles, Share } from 'lucide-react';
import { QRCodeSettings } from '../types/qr';
import { copyToClipboard, downloadQRCode, CopyResult, DownloadResult } from '../utils/browserCompat';

interface QRCodeDisplayProps {
  qrData: string;
  settings: QRCodeSettings;
  onSettingsChange: (settings: QRCodeSettings) => void;
  shortId?: string;
}

export default function QRCodeDisplay({ qrData, settings, onSettingsChange, shortId }: QRCodeDisplayProps) {
  const [copied, setCopied] = React.useState(false);
  const [copyError, setCopyError] = React.useState<string | null>(null);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);
  const [showSettings, setShowSettings] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleDownload = async () => {
    setDownloadError(null);

    const filename = `qr-code-${shortId || Date.now()}.png`;
    
    try {
      const result = await downloadQRCode(filename);
      
      if (!result.success) {
        setDownloadError(result.error || 'Download failed');
        // Clear error after 5 seconds
        setTimeout(() => setDownloadError(null), 5000);
      }
    } catch (error) {
      setDownloadError('Download failed. Please try again.');
      setTimeout(() => setDownloadError(null), 5000);
    }
  };

  const handleCopy = async () => {
    setCopyError(null);

    const result = await copyToClipboard(qrData);

    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopyError(result.error || 'Copy failed');
      // Clear error after 5 seconds
      setTimeout(() => setCopyError(null), 5000);
    }
  };

  if (!qrData) {
    return (
      <div className="card p-8 text-center animate-scale-in">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">3</span>
          </div>
          <h3 className="text-xl font-semibold text-white">Generated QR Code</h3>
          <Sparkles size={16} className="text-green-400 animate-bounce-subtle" />
        </div>
        
        <div className="relative group">
          <div className="w-72 h-72 bg-slate-700/60 border-2 border-dashed border-slate-500 rounded-2xl flex flex-col items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:border-slate-400">
            <div className="p-4 bg-slate-600/60 rounded-full mb-4 group-hover:bg-slate-500/60 transition-colors duration-300">
              <QrCodeIcon size={40} className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300" />
            </div>
            <span className="text-slate-200 text-lg font-medium group-hover:text-white transition-colors duration-300">QR Code Preview</span>
            <span className="text-slate-400 text-sm mt-2">Configure your settings and generate</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-300 max-w-md leading-relaxed">
            Complete the form on the left to generate your custom QR code with device detection and analytics.
          </p>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
            <span>Waiting for configuration</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-8 animate-scale-in">
      <div className="flex items-center gap-3 justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">3</span>
          </div>
          <h3 className="text-xl font-semibold text-white">Generated QR Code</h3>
          <Sparkles size={16} className="text-green-400 animate-bounce-subtle" />
        </div>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-all duration-200 ${showSettings ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600'}`}
        >
          <Settings size={16} />
        </button>
      </div>
      
      <div className="text-center mb-8">
        <div className="relative inline-block group">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          
          {/* QR Code container */}
          <div className="relative bg-white p-6 rounded-2xl shadow-2xl transform transition-transform duration-300 hover:scale-105">
            <QRCode
              value={qrData}
              size={settings.size}
              bgColor={settings.bgColor}
              fgColor={settings.fgColor}
              level={settings.errorCorrectionLevel}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <button
            onClick={handleDownload}
            className="btn-primary group"
          >
            <Download size={16} className="transform group-hover:scale-110 transition-transform duration-200" />
            Download PNG
          </button>
          <button
            onClick={handleCopy}
            className={`btn-secondary group ${copied ? 'bg-green-600 hover:bg-green-700 border-green-500' : ''}`}
          >
            {copied ? (
              <>
                <Check size={16} className="text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} className="transform group-hover:scale-110 transition-transform duration-200" />
                Copy URL
              </>
            )}
          </button>
          <button
            className="btn-ghost group"
            onClick={() => navigator.share && navigator.share({ url: qrData, title: 'QR Code' }).catch(() => {})}
          >
            <Share size={16} className="transform group-hover:scale-110 transition-transform duration-200" />
            Share
          </button>
        </div>

        {/* Error messages */}
        {downloadError && (
          <div className="mt-3 p-2 bg-red-900/50 border border-red-700 rounded-lg">
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <AlertTriangle size={14} />
              {downloadError}
            </div>
          </div>
        )}

        {copyError && (
          <div className="mt-3 p-2 bg-red-900/50 border border-red-700 rounded-lg">
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <AlertTriangle size={14} />
              {copyError}
            </div>
          </div>
        )}
      </div>

      {/* Customization Panel */}
      {showSettings && (
        <div className="mt-8 p-6 bg-slate-800/60 rounded-2xl border border-slate-600/50 animate-slide-in">
          <div className="flex items-center gap-2 mb-6">
            <Palette size={16} className="text-indigo-400" />
            <h4 className="text-lg font-semibold text-white">Customization</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                  <QrCodeIcon size={16} className="text-indigo-400" />
                  Size: {settings.size}px
                </label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  step="16"
                  value={settings.size}
                  onChange={(e) => onSettingsChange({ ...settings, size: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>128px</span>
                  <span>512px</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">Error Correction Level</label>
                <select
                  value={settings.errorCorrectionLevel}
                  onChange={(e) => onSettingsChange({ ...settings, errorCorrectionLevel: e.target.value as any })}
                  className="input-field text-sm"
                >
                  <option value="L">Low (7%) - More data capacity</option>
                  <option value="M">Medium (15%) - Balanced</option>
                  <option value="Q">Quartile (25%) - Good recovery</option>
                  <option value="H">High (30%) - Best recovery</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">QR Code Color</label>
                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={settings.fgColor}
                      onChange={(e) => onSettingsChange({ ...settings, fgColor: e.target.value })}
                      className="w-12 h-12 border-2 border-gray-600 rounded-xl cursor-pointer overflow-hidden"
                    />
                    <div className="absolute inset-0 rounded-xl border-2 border-gray-600 pointer-events-none"></div>
                  </div>
                  <input
                    type="text"
                    value={settings.fgColor}
                    onChange={(e) => onSettingsChange({ ...settings, fgColor: e.target.value })}
                    className="input-field text-sm font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">Background Color</label>
                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={settings.bgColor}
                      onChange={(e) => onSettingsChange({ ...settings, bgColor: e.target.value })}
                      className="w-12 h-12 border-2 border-gray-600 rounded-xl cursor-pointer overflow-hidden"
                    />
                    <div className="absolute inset-0 rounded-xl border-2 border-gray-600 pointer-events-none"></div>
                  </div>
                  <input
                    type="text"
                    value={settings.bgColor}
                    onChange={(e) => onSettingsChange({ ...settings, bgColor: e.target.value })}
                    className="input-field text-sm font-mono"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {shortId && (
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Short Link ID:</p>
          <code className="text-xs text-indigo-400 font-mono">{shortId}</code>
        </div>
      )}
    </div>
  );
}