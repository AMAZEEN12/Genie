export interface GenieLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export function GenieLogo({ className = '', size = 'hero' }: GenieLogoProps) {
  // Size classes for the overall typography
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl sm:text-7xl',
    hero: 'text-7xl sm:text-8xl md:text-9xl lg:text-[144px]',
  }[size];

  // Dimension scaling for the 3D 'i' icon
  const iconSizes = {
    sm: { width: 14, height: 26 },
    md: { width: 20, height: 38 },
    lg: { width: 32, height: 62 },
    hero: { width: 64, height: 124 },
  }[size];

  return (
    <div
      className={`inline-flex items-baseline font-display font-extrabold tracking-tight text-white select-none ${sizeClasses} ${className}`}
      aria-label="Genie"
    >
      <span>Gen</span>
      <span className="relative inline-flex items-center justify-center mx-[0.03em] self-center">
        {/* Neon Glow behind 3D block */}
        <span
          className="absolute inset-0 bg-[#E1EE04] blur-2xl opacity-50 rounded-full scale-125 -z-10"
          aria-hidden="true"
        />
        <svg
          width={iconSizes.width}
          height={iconSizes.height}
          viewBox="0 0 64 124"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="inline-block overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <filter id="i-glow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="top-face" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F9FF60" />
              <stop offset="100%" stopColor="#E5F304" />
            </linearGradient>
            <linearGradient id="front-face" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E1EE04" />
              <stop offset="100%" stopColor="#BAC503" />
            </linearGradient>
            <linearGradient id="side-face" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#969F02" />
              <stop offset="100%" stopColor="#6C7301" />
            </linearGradient>
          </defs>

          {/* Dot of the 'i' (Isometric 3D Cube) */}
          <g filter="url(#i-glow)">
            {/* Top face */}
            <polygon points="12,10 52,10 60,2 20,2" fill="url(#top-face)" />
            {/* Front face */}
            <polygon points="12,10 52,10 52,36 12,36" fill="url(#front-face)" />
            {/* Right side face */}
            <polygon points="52,10 60,2 60,28 52,36" fill="url(#side-face)" />
            {/* Edge highlights */}
            <line x1="12" y1="10" x2="52" y2="10" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="52" y1="10" x2="60" y2="2" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />
          </g>

          {/* Stem of the 'i' (Isometric 3D Cuboid) */}
          <g filter="url(#i-glow)">
            {/* Top face */}
            <polygon points="12,50 52,50 60,42 20,42" fill="url(#top-face)" />
            {/* Front face */}
            <polygon points="12,50 52,50 52,120 12,120" fill="url(#front-face)" />
            {/* Right side face */}
            <polygon points="52,50 60,42 60,112 52,120" fill="url(#side-face)" />
            {/* Edge highlights */}
            <line x1="12" y1="50" x2="52" y2="50" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="52" y1="50" x2="60" y2="42" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />
          </g>
        </svg>
      </span>
      <span>e</span>
    </div>
  );
}
