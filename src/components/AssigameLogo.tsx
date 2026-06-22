import React from 'react';

interface AssigameLogoProps {
  className?: string; // Additional classes for font sizes e.g. text-2xl
  color?: string;     // Color override, defaults to current site color or text-shopera-burgundy
  showSparkle?: boolean;
}

export default function AssigameLogo({
  className = "text-2xl",
  color,
  showSparkle = true,
}: AssigameLogoProps) {
  // We can style with inline CSS or classes to adapt. 
  // It uses var(--font-cinzel) defined in index.css
  const finalStyle: React.CSSProperties = {
    fontFamily: 'var(--font-cinzel), "Cinzel", "Playfair Display", serif',
    fontWeight: 700,
  };

  if (color) {
    finalStyle.color = color;
  }

  return (
    <span 
      style={finalStyle} 
      className={`inline-flex items-center leading-none tracking-wide select-none ${className} select-none`}
    >
      <span className="tracking-[0.05em]">ASSI</span>
      {showSparkle ? (
        <span className="relative inline-flex items-center justify-center">
          <span className="tracking-[0.05em]">G</span>
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none mb-[0.03em] ml-[0.03em]">
            <svg 
              viewBox="0 0 100 100" 
              className="w-[0.44em] h-[0.44em]"
              fill="currentColor"
              aria-hidden="true"
            >
              {/* Ultra-precise elegant four-pointed star vector (sparkle/diamond) */}
              <path d="M 50 0 C 50 35, 65 50, 100 50 C 65 50, 50 65, 50 100 C 50 65, 35 50, 0 50 C 35 50, 50 35, 50 0 Z" />
            </svg>
          </span>
        </span>
      ) : (
        <span className="tracking-[0.05em]">G</span>
      )}
      <span className="tracking-[0.05em]">AME</span>
    </span>
  );
}
