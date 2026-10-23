import React from 'react';
import { cn } from '../lib/utils';

interface KmrlLogoProps {
  className?: string;
  showWordmark?: boolean;
  markClassName?: string;
  invert?: boolean;
}

export function KmrlLogo({ className, showWordmark = true, markClassName, invert = false }: KmrlLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/kmrl-logo.png"
        alt="Kochi Metro Rail Limited"
        className={cn("h-11 w-auto object-contain", markClassName)}
      />
      {showWordmark && (
        <div className="flex flex-col text-left">
          <span
            className={cn(
              "text-xs font-black tracking-wider uppercase",
              invert ? "text-white" : "text-navy",
            )}
          >
            KOCHI METRO
          </span>
          <span
            className={cn(
              "text-[9px] font-semibold tracking-wider uppercase -mt-0.5",
              invert ? "text-teal-300" : "text-teal-700",
            )}
          >
            Rail Limited
          </span>
        </div>
      )}
    </div>
  );
}
