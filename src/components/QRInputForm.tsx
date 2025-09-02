import React from 'react';
import { QRFormData } from '../types/qr';
import { Globe, Smartphone, Shield, Eye, EyeOff, Phone, AlertTriangle } from 'lucide-react';
import { validateURL, validatePhoneNumber, validateWiFiCredentials, ValidationResult } from '../utils/validation';

interface QRInputFormProps {
  formData: QRFormData;
  onFormChange: (data: QRFormData) => void;
}

export default function QRInputForm({ formData, onFormChange }: QRInputFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, ValidationResult>>({});
  const [validationWarnings, setValidationWarnings] = React.useState<Record<string, string>>({});

  const validateField = (field: string, value: any) => {
    let validation: ValidationResult = { isValid: true };

    if (field === 'url' || field.includes('url')) {
      validation = validateURL(value);
    } else if (field === 'phone') {
      validation = validatePhoneNumber(value);
    } else if (field === 'ssid' || field === 'password') {
      if (formData.ssid && formData.password) {
        validation = validateWiFiCredentials(formData.ssid, formData.password, formData.security || 'WPA');
      }
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: validation
    }));

    if (validation.warning) {
      setValidationWarnings(prev => ({
        ...prev,
        [field]: validation.warning
      }));
    } else {
      setValidationWarnings(prev => {
        const newWarnings = { ...prev };
        delete newWarnings[field];
        return newWarnings;
      });
    }

    return validation.isValid;
  };

  const handleInputChange = (field: string, value: any) => {
    onFormChange({ ...formData, [field]: value });

    // Validate after a short delay to avoid validating while typing
    setTimeout(() => validateField(field, value), 500);
  };

  const handleUrlChange = (platform: 'ios' | 'android' | 'web', value: string) => {
    const newUrls = { ...formData.urls, [platform]: value };
    onFormChange({ ...formData, urls: newUrls });

    // Validate URL
    setTimeout(() => validateField(`urls.${platform}`, value), 500);
  };

  const renderValidationMessage = (field: string) => {
    const error = validationErrors[field];
    const warning = validationWarnings[field];

    if (error && !error.isValid) {
      return (
        <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
          <AlertTriangle size={12} />
          {error.error}
        </div>
      );
    }

    if (warning) {
      return (
        <div className="flex items-center gap-1 mt-1 text-yellow-400 text-xs">
          <AlertTriangle size={12} />
          {warning}
        </div>
      );
    }

    return null;
  };

  const getInputClassName = (field: string, baseClassName: string) => {
    const error = validationErrors[field];
    const hasError = error && !error.isValid;
    const hasWarning = validationWarnings[field];

    let borderColor = 'border-gray-700 focus:border-indigo-500';
    if (hasError) {
      borderColor = 'border-red-500 focus:border-red-400';
    } else if (hasWarning) {
      borderColor = 'border-yellow-500 focus:border-yellow-400';
    }

    return `${baseClassName} ${borderColor}`;
  };

  const renderInputs = () => {
    switch (formData.type) {
      case 'link':
        return (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Smartphone size={16} />
                iOS URL (App Store / Apple devices)
              </label>
              <input
                type="url"
                value={formData.urls?.ios || ''}
                onChange={(e) => handleUrlChange('ios', e.target.value)}
                placeholder="https://apps.apple.com/app/..."
                className={getInputClassName('urls.ios', "w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 transition-colors")}
              />
              {renderValidationMessage('urls.ios')}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Smartphone size={16} />
                Android URL (Play Store / APK)
              </label>
              <input
                type="url"
                value={formData.urls?.android || ''}
                onChange={(e) => handleUrlChange('android', e.target.value)}
                placeholder="https://play.google.com/store/apps/..."
                className={getInputClassName('urls.android', "w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 transition-colors")}
              />
              {renderValidationMessage('urls.android')}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Globe size={16} />
                Web URL (Default fallback)
              </label>
              <input
                type="url"
                value={formData.urls?.web || ''}
                onChange={(e) => handleUrlChange('web', e.target.value)}
                placeholder="https://example.com"
                className={getInputClassName('urls.web', "w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 transition-colors")}
                required
              />
              {renderValidationMessage('urls.web')}
            </div>
          </div>
        );

      case 'appstore':
        return (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Smartphone size={16} />
              App Store URL
            </label>
            <input
              type="url"
              value={formData.url || ''}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://apps.apple.com/app/..."
              className={getInputClassName('url', "w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 transition-colors")}
              required
            />
            {renderValidationMessage('url')}
          </div>
        );

      case 'qrdylink':
        return (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Globe size={16} />
              Target URL
            </label>
            <input
              type="url"
              value={formData.url || ''}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://example.com"
              className={getInputClassName('url', "w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 transition-colors")}
              required
            />
            {renderValidationMessage('url')}
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Network Name (SSID)
              </label>
              <input
                type="text"
                value={formData.ssid || ''}
                onChange={(e) => handleInputChange('ssid', e.target.value)}
                placeholder="MyWiFiNetwork"
                className={getInputClassName('ssid', "w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 transition-colors")}
                required
              />
              {renderValidationMessage('ssid')}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password || ''}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter Wi-Fi password"
                  className={getInputClassName('password', "w-full px-4 py-3 pr-12 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 transition-colors")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {renderValidationMessage('password')}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Shield size={16} />
                Security Type
              </label>
              <select
                value={formData.security || 'WPA'}
                onChange={(e) => handleInputChange('security', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hidden"
                checked={formData.hidden || false}
                onChange={(e) => handleInputChange('hidden', e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="hidden" className="text-sm text-gray-300">
                Hidden Network
              </label>
            </div>
          </div>
        );

      case 'phone':
        return (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Phone size={16} />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1234567890"
              className={getInputClassName('phone', "w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 transition-colors")}
              required
            />
            {renderValidationMessage('phone')}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">QR Code Data</h3>
      {renderInputs()}
    </div>
  );
}