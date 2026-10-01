import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { img: 'w-9 h-9', text: 'text-lg', tag: 'text-[9px]' },
    md: { img: 'w-12 h-12', text: 'text-xl', tag: 'text-[10px]' },
    lg: { img: 'w-16 h-16', text: 'text-2xl', tag: 'text-xs' },
    xl: { img: 'w-24 h-24', text: 'text-4xl', tag: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official emblem icon rendered from SVG asset */}
      <div className={`relative shrink-0 ${currentSize.img} rounded-full overflow-hidden shadow-sm border border-emerald-500/20 bg-white`}>
        <img
          src="/logo.svg"
          alt="Varsha Mitra Logo"
          className="w-full h-full object-contain transform scale-110"
        />
      </div>

      <div className="flex flex-col leading-tight">
        <div className={`font-black tracking-tight ${currentSize.text} flex items-center`}>
          <span className="text-sky-600 dark:text-sky-400">Varsha</span>
          <span className="text-emerald-700 dark:text-emerald-400">Mitra</span>
          <span className="ml-0.5 text-xs text-emerald-500">🌱</span>
        </div>

        {showTagline && (
          <span className={`font-medium text-slate-500 dark:text-slate-400 font-hindi ${currentSize.tag} tracking-wide border-t border-emerald-500/30 pt-0.5 mt-0.5`}>
            बारिश का पूर्वानुमान, खेती का सही निर्णय।
          </span>
        )}
      </div>
    </div>
  );
};
