"use client";

// Architected and built by Claudesy.

import type { ReactNode } from "react";

interface GridBackgroundProps {
  children?: ReactNode;
  className?: string;
  cellSize?: number;
  crossArm?: number;
  lineOpacity?: number;
  crossOpacity?: number;
}

export function GridBackground({ children, className = "" }: GridBackgroundProps) {
  return (
    <div className={`grid-bg-root ${className}`}>
      {/* Layer 1: gradient base */}
      <div className="grid-bg-gradient" />

      {/* Layer 2: dot grid */}
      <div className="grid-bg-dots" />

      {/* Layer 3: radial vignette fade */}
      <div className="grid-bg-vignette" />

      {/* Content */}
      <div className="grid-bg-content">
        {children}
      </div>
    </div>
  );
}
