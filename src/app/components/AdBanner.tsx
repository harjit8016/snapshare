import { useEffect, useRef } from 'react';

interface AdBannerProps {
  format?: 'horizontal' | 'rectangle' | 'vertical';
  slot: string;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdBanner({ format = 'horizontal', slot, className = '', style = {} }: AdBannerProps) {
  const adRef = useRef<boolean>(false);
  const client = import.meta.env.VITE_ADSENSE_CLIENT;

  useEffect(() => {
    // Prevent double pushing in dev mode/strict mode
    if (adRef.current) return;
    
    if (client && client !== 'ca-pub-XXXXXXXXXXXXXXXX' && slot) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adRef.current = true;
      } catch (err) {
        console.error('AdSense error:', err);
      }
    } else {
      console.warn(`AdSense placeholder active for slot: ${slot}. Update .env to enable real ads.`);
    }
  }, [client, slot]);

  // Standard Google AdSense sizes for the placeholder
  const dimensions = {
    horizontal: { width: '728px', height: '90px' },
    rectangle: { width: '300px', height: '250px' },
    vertical: { width: '160px', height: '600px' },
  };

  const placeholderSize = dimensions[format];

  // If no client ID is set, just render a placeholder div to preserve layout
  if (!client || client === 'ca-pub-XXXXXXXXXXXXXXXX') {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 ${className}`} 
        style={{ ...placeholderSize, maxWidth: '100%', ...style }}
      >
        <div className="text-center p-4">
          <p className="text-sm text-gray-500 font-medium">Advertisement</p>
          <p className="text-xs text-gray-400 mt-1">{placeholderSize.width} × {placeholderSize.height}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`} style={{ ...style, minWidth: placeholderSize.width, minHeight: placeholderSize.height }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
