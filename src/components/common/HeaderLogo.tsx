import React from 'react';

interface HeaderLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export const HeaderLogo: React.FC<HeaderLogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
  className = '',
}) => {
  const pixelSizes = {
    sm: 20,
    md: 28,
    lg: 36,
    xl: 48,
  };

  const textSizes = {
    sm: 'text-xs uppercase tracking-widest font-bold',
    md: 'text-sm uppercase tracking-widest font-extrabold',
    lg: 'text-lg uppercase tracking-widest font-black',
    xl: 'text-2xl uppercase tracking-widest font-black',
  };

  const currentPixelSize = pixelSizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Glowing White Geometric Scissors Logo */}
      <div className="relative flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">
        <svg
          width={currentPixelSize}
          height={currentPixelSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6" cy="6" r="3"></circle>
          <circle cx="6" cy="18" r="3"></circle>
          <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
          <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
          <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} text-white font-sans flex items-center gap-1`}>
            CLIP <span className="text-[#666666] font-normal">STATION</span>
          </span>
          {subtitle && (
            <span className="text-[10px] text-[#666666] font-semibold uppercase tracking-wider">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

