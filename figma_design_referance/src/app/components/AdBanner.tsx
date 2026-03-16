interface AdBannerProps {
  slot?: string;
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

export function AdBanner({ slot = '1234567890', format = 'horizontal', className = '' }: AdBannerProps) {
  // Standard Google AdSense sizes
  const dimensions = {
    horizontal: { width: '728px', height: '90px' }, // Leaderboard
    rectangle: { width: '300px', height: '250px' }, // Medium Rectangle
    vertical: { width: '160px', height: '600px' }, // Wide Skyscraper
  };

  const size = dimensions[format];

  return (
    <div className={`flex items-center justify-center bg-gray-100 border border-gray-300 ${className}`} style={{ width: size.width, height: size.height, maxWidth: '100%' }}>
      {/* Placeholder for Google AdSense */}
      {/* In production, replace with actual Google AdSense code:
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot={slot}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      */}
      <div className="text-center p-4">
        <p className="text-sm text-gray-500 font-medium">Advertisement</p>
        <p className="text-xs text-gray-400 mt-1">{size.width} × {size.height}</p>
        <p className="text-xs text-gray-400 mt-2">
          Google AdSense Placeholder
        </p>
      </div>
    </div>
  );
}
