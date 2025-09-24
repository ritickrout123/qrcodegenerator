import React from 'react';
import { motion } from 'framer-motion';
import { QRFormData } from '../types/qr';
import { Globe, Smartphone, Shield, Phone, Sparkles, Wifi } from 'lucide-react';
import { validateURL, validatePhoneNumber, validateWiFiCredentials, ValidationResult } from '../utils/validation';
import { cn, getTextGradientClasses } from '../utils/classNames';
import Card from './ui/Card';
import Input from './ui/Input';
import Tooltip from './ui/Tooltip';

interface QRInputFormProps {
  formData: QRFormData;
  onFormChange: (data: QRFormData) => void;
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
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
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

export default function QRInputForm({ formData, onFormChange }: QRInputFormProps) {
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

  const getValidationProps = (field: string) => {
    const error = validationErrors[field];
    const warning = validationWarnings[field];
    const fieldValue = getFieldValue(field);
    const hasValue = fieldValue && fieldValue.trim() !== '';

    if (error && !error.isValid) {
      return { error: error.error };
    }
    if (warning) {
      return { warning: warning };
    }
    if (hasValue && error && error.isValid) {
      return { success: 'Valid input' };
    }
    return {};
  };

  const getFieldValue = (field: string) => {
    if (field.includes('urls.')) {
      const platform = field.split('.')[1] as 'ios' | 'android' | 'web';
      return formData.urls?.[platform] || '';
    }
    return formData[field as keyof QRFormData] as string || '';
  };

  const renderInputs = () => {
    switch (formData.type) {
      case 'link':
        return (
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Tooltip content="URL for iOS devices - will redirect iPhone and iPad users here">
                <Input
                  type="url"
                  label={(
                    <div className="flex items-center gap-2">
                      <Smartphone size={16} className="text-indigo-400" />
                      iOS URL (App Store / Apple devices)
                    </div>
                  )}
                  value={formData.urls?.ios || ''}
                  onChange={(e) => handleUrlChange('ios', e.target.value)}
                  placeholder="https://apps.apple.com/app/appname/id123456789"
                  leftIcon={<Smartphone size={18} className="text-indigo-400" />}
                  {...getValidationProps('urls.ios')}
                />
              </Tooltip>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Tooltip content="URL for Android devices - will redirect Android users here">
                <Input
                  type="url"
                  label={(
                    <div className="flex items-center gap-2">
                      <Smartphone size={16} className="text-green-400" />
                      Android URL (Play Store / APK)
                    </div>
                  )}
                  value={formData.urls?.android || ''}
                  onChange={(e) => handleUrlChange('android', e.target.value)}
                  placeholder="https://play.google.com/store/apps/details?id=..."
                  leftIcon={<Smartphone size={18} className="text-green-400" />}
                  {...getValidationProps('urls.android')}
                />
              </Tooltip>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Tooltip content="Default fallback URL for desktop and unrecognized devices">
                <Input
                  type="url"
                  label={(
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-blue-400" />
                      Web URL (Default fallback) *
                    </div>
                  )}
                  value={formData.urls?.web || ''}
                  onChange={(e) => handleUrlChange('web', e.target.value)}
                  placeholder="https://example.com"
                  leftIcon={<Globe size={18} className="text-blue-400" />}
                  required
                  {...getValidationProps('urls.web')}
                />
              </Tooltip>
            </motion.div>
          </motion.div>
        );

      case 'appstore':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Tooltip content="Direct link to your app in the Apple App Store">
              <Input
                type="url"
                label={(
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} className="text-gray-400" />
                    App Store URL
                  </div>
                )}
                value={formData.url || ''}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://apps.apple.com/app/..."
                leftIcon={<Smartphone size={18} className="text-gray-400" />}
                required
                {...getValidationProps('url')}
              />
            </Tooltip>
          </motion.div>
        );

      case 'qrdylink':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Tooltip content="The URL that will be shortened and redirected to">
              <Input
                type="url"
                label={(
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-purple-400" />
                    Target URL
                  </div>
                )}
                value={formData.url || ''}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://example.com"
                leftIcon={<Globe size={18} className="text-purple-400" />}
                required
                {...getValidationProps('url')}
              />
            </Tooltip>
          </motion.div>
        );

      case 'wifi':
        return (
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Tooltip content="The WiFi network name that devices will connect to">
                <Input
                  type="text"
                  label={(
                    <div className="flex items-center gap-2">
                      <Wifi size={16} className="text-blue-400" />
                      Network Name (SSID)
                    </div>
                  )}
                  value={formData.ssid || ''}
                  onChange={(e) => handleInputChange('ssid', e.target.value)}
                  placeholder="MyWiFiNetwork"
                  leftIcon={<Wifi size={18} className="text-blue-400" />}
                  required
                  {...getValidationProps('ssid')}
                />
              </Tooltip>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Tooltip content="WiFi password - leave empty for open networks">
                <Input
                  type="password"
                  label="Password"
                  value={formData.password || ''}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter Wi-Fi password"
                  leftIcon={<Shield size={18} className="text-green-400" />}
                  showPasswordToggle
                  {...getValidationProps('password')}
                />
              </Tooltip>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Tooltip content="Security protocol used by your WiFi network">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Shield size={16} className="text-orange-400" />
                    Security Type
                  </label>
                  <select
                    value={formData.security || 'WPA'}
                    onChange={(e) => handleInputChange('security', e.target.value)}
                    className="input-field"
                  >
                    <option value="WPA">WPA/WPA2 (Recommended)</option>
                    <option value="WEP">WEP (Legacy)</option>
                    <option value="nopass">No Password (Open)</option>
                  </select>
                </div>
              </Tooltip>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Tooltip content="Enable if your network doesn't broadcast its name">
                <div className="flex items-center gap-3 p-4 rounded-xl glass-morphism border border-white/10">
                  <input
                    type="checkbox"
                    id="hidden"
                    checked={formData.hidden || false}
                    onChange={(e) => handleInputChange('hidden', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-transparent border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 transition-colors"
                  />
                  <label htmlFor="hidden" className="text-sm font-medium text-gray-300 cursor-pointer select-none">
                    Hidden Network
                  </label>
                </div>
              </Tooltip>
            </motion.div>
          </motion.div>
        );

      case 'phone':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Tooltip content="Phone number for click-to-call functionality with international format">
              <Input
                type="tel"
                label={(
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-emerald-400" />
                    Phone Number
                  </div>
                )}
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1234567890"
                leftIcon={<Phone size={18} className="text-emerald-400" />}
                description="Include country code for international numbers (e.g., +1 for US)"
                required
                {...getValidationProps('phone')}
              />
            </Tooltip>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Card padding="lg" animate>
      <motion.div 
        className="flex items-center gap-4 mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">2</span>
          </div>
          <motion.div
            className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl blur"
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
        
        <div className="flex-1">
          <motion.h3 
            className={cn(
              "text-2xl font-bold mb-1",
              getTextGradientClasses('primary')
            )}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{ backgroundSize: '200% 200%' }}
          >
            Configure Your QR Code
          </motion.h3>
          <p className="text-gray-400 text-sm">Customize your QR code with the options below</p>
        </div>
        
        <motion.div
          animate={{
            y: [0, -5, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <Sparkles size={20} className="text-purple-400" />
        </motion.div>
      </motion.div>
      
      {renderInputs()}
    </Card>
  );
}