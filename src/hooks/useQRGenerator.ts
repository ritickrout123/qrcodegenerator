import { useState } from 'react';
import { QRFormData, QRCodeSettings } from '../types/qr';
import { handleNetworkError, retryRequest } from '../utils/browserCompat';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export function useQRGenerator() {
  const [qrData, setQrData] = useState<string>('');
  const [shortId, setShortId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQR = async (formData: QRFormData) => {
    setLoading(true);
    setError(null);

    try {
      const makeRequest = async () => {
        const endpoint = API_BASE.includes('netlify') ? `${API_BASE}/generate-qr` : `${API_BASE}/generate-qr`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({
            type: formData.type,
            data: formData
          }),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Server error (${response.status}): ${errorText}`);
        }

        return response.json();
      };

      // Use retry logic for network requests
      const result = await retryRequest(makeRequest, 3, 1000);

      setQrData(result.qrData);
      setShortId(result.shortId || '');
    } catch (err) {
      const errorMessage = handleNetworkError(err);
      setError(errorMessage);
      console.error('QR Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    qrData,
    shortId,
    loading,
    error,
    generateQR,
    clearQR: () => {
      setQrData('');
      setShortId('');
      setError(null);
    }
  };
}