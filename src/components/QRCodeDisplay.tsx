import React from 'react';
import QRCode from 'react-qr-code';
import { Download, Copy, Check, AlertTriangle } from 'lucide-react';
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

  const handleDownload = () => {
    setDownloadError(null);

    const filename = `qr-code-${shortId || Date.now()}.png`;
    const result = downloadQRCode(filename);

    if (!result.success) {
      setDownloadError(result.error || 'Download failed');
      // Clear error after 5 seconds
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
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center">
        <div className="w-64 h-64 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-gray-500">QR Code will appear here</span>
        </div>
        <p className="text-gray-400">Fill in the form to generate your QR code</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="text-center mb-6">
        <div className="bg-white p-4 rounded-xl inline-block mb-4">
          <QRCode
            value={qrData}
            size={settings.size}
            bgColor={settings.bgColor}
            fgColor={settings.fgColor}
            level={settings.errorCorrectionLevel}
          />
        </div>
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Download size={16} />
            Download
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy URL'}
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

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Customization</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Size</label>
            <input
              type="range"
              min="128"
              max="512"
              value={settings.size}
              onChange={(e) => onSettingsChange({ ...settings, size: parseInt(e.target.value) })}
              className="w-full accent-indigo-500"
            />
            <span className="text-xs text-gray-500">{settings.size}px</span>
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Error Correction</label>
            <select
              value={settings.errorCorrectionLevel}
              onChange={(e) => onSettingsChange({ ...settings, errorCorrectionLevel: e.target.value as any })}
              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Foreground Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.fgColor}
                onChange={(e) => onSettingsChange({ ...settings, fgColor: e.target.value })}
                className="w-8 h-8 border border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.fgColor}
                onChange={(e) => onSettingsChange({ ...settings, fgColor: e.target.value })}
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.bgColor}
                onChange={(e) => onSettingsChange({ ...settings, bgColor: e.target.value })}
                className="w-8 h-8 border border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.bgColor}
                onChange={(e) => onSettingsChange({ ...settings, bgColor: e.target.value })}
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {shortId && (
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Short Link ID:</p>
          <code className="text-xs text-indigo-400 font-mono">{shortId}</code>
        </div>
      )}
    </div>
  );
}