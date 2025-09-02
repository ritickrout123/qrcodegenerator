export interface QRFormData {
  type: 'link' | 'appstore' | 'qrdylink' | 'wifi' | 'phone';
  urls?: {
    ios: string;
    android: string;
    web: string;
  };
  url?: string;
  ssid?: string;
  password?: string;
  security?: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
  phone?: string;
  text?: string;
}

export interface QRCodeSettings {
  size: number;
  bgColor: string;
  fgColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface QRType {
  id: string;
  name: string;
  description: string;
  icon: string;
}