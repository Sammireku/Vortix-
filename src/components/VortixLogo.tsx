import React from 'react';

interface VortixLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge';
  theme?: 'dark' | 'light' | 'adaptive';
  showTagline?: boolean;
}

export const VortixLogo: React.FC<VortixLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  theme = 'adaptive',
  showTagline = true,
}) => {
  // Color palette matching Vortix theme:
  // Primary dark olive/charcoal: #2D2D24
  // Sage/Earth accent: #5A5A40
  // Sand/Cream neutral: #FAF9F5, #E5E5DE, #8B7E66
  
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-sm', tag: 'text-[9px]' },
    md: { icon: 'w-8 h-8', text: 'text-base', tag: 'text-[10px]' },
    lg: { icon: 'w-10 h-10', text: 'text-xl', tag: 'text-xs' },
    xl: { icon: 'w-14 h-14', text: 'text-2xl', tag: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  // SVG representation of the Vortix dynamic vortex/cyclone with ascending arrow
  const VortexIcon = ({ svgClassName }: { svgClassName?: string }) => (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={svgClassName || currentSize.icon}
      aria-label="Vortix Logo"
    >
      <defs>
        <linearGradient id="vortixGrad" x1="20%" y1="100%" x2="80%" y2="0%">
          <stop offset="0%" stopColor="#8B7E66" />
          <stop offset="50%" stopColor="#5A5A40" />
          <stop offset="100%" stopColor="#2E6930" />
        </linearGradient>
        <linearGradient id="vortixGradLight" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FAF9F5" />
          <stop offset="60%" stopColor="#E5E5DE" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      {/* Dynamic swirling vortex loops narrowing to bottom tip */}
      {/* Bottom swirl tip */}
      <path
        d="M50 88C49 84 48 81 48 78C48 73 53 71 55 72C58 73.5 56 78 52 79C49 80 49.5 84 50 88Z"
        fill="currentColor"
        opacity="0.85"
      />

      {/* Loop 1: Lower narrow loop */}
      <path
        d="M42 71C38 68 39 63 47 62C55 61 61 63 60 67C59 70 54 72 48 72C44 72 40 73 42 71Z"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Loop 2: Mid-lower expanding spiral */}
      <path
        d="M34 58C30 54 33 48 46 47C60 46 68 49 67 54C66 58 57 60 48 60C38 60 33 60 34 58Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Loop 3: Upper mid loop */}
      <path
        d="M26 44C22 39 27 32 47 31C68 30 78 34 77 40C76 45 64 47 51 47C36 47 28 47 26 44Z"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Top Main Swirl Loop transitioning into the ascending arrow */}
      <path
        d="M20 30C16 22 26 16 50 16C68 16 78 20 80 25C81 29 74 34 60 36C45 38 27 36 21 30"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Ascending dynamic vector arrow sweeping up and right */}
      <path
        d="M44 38C48 30 55 22 66 17L70 15"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      <path
        d="M62 10L77 13L72 26L67 19L62 10Z"
        fill="currentColor"
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <VortexIcon />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border font-mono ${
          theme === 'dark'
            ? 'bg-[#2D2D24] text-[#FAF9F5] border-[#3D3D32]'
            : 'bg-[#F5F5F0] text-[#2D2D24] border-[#E5E5DE]'
        } ${className}`}
      >
        <VortexIcon svgClassName="w-4 h-4 text-[#5A5A40]" />
        <span className="font-bold tracking-wider text-xs">VORTIX</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Vortex Icon Container styled in brand colors */}
      <div
        className={`shrink-0 rounded-xl flex items-center justify-center p-1.5 shadow-2xs transition-all ${
          theme === 'dark'
            ? 'bg-[#5A5A40] text-[#FAF9F5] hover:bg-[#4E4E36]'
            : theme === 'light'
            ? 'bg-[#2D2D24] text-[#FAF9F5]'
            : 'bg-[#5A5A40] text-[#FAF9F5]'
        }`}
      >
        <VortexIcon />
      </div>

      {/* Wordmark and Tagline */}
      <div className="flex flex-col select-none leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-sans font-black tracking-wider uppercase leading-tight ${currentSize.text} ${
              theme === 'dark' ? 'text-[#FAF9F5]' : 'text-[#2D2D24]'
            }`}
            style={{ letterSpacing: '0.08em' }}
          >
            VORTIX
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E6930] shrink-0" title="System Operational" />
        </div>
        {showTagline && (
          <span
            className={`font-mono font-medium uppercase tracking-widest mt-0.5 ${currentSize.tag} ${
              theme === 'dark' ? 'text-[#C5C5BC]' : 'text-[#8B7E66]'
            }`}
            style={{ letterSpacing: '0.12em' }}
          >
            Build. Scale. Orchestrate.
          </span>
        )}
      </div>
    </div>
  );
};
