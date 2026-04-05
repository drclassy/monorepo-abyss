"use client";

// Architected and built by Claudesy.

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

type MenuItem = {
  label: string;
  sub?: string;
  onClick?: () => void;
  active?: boolean;
};

interface MenuVerticalProps {
  menuItems: MenuItem[];
  skew?: number;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: { text: "text-sm",     sub: "text-[10px]", arrowSize: 13, gap: "gap-[6px]" },
  md: { text: "text-xl",     sub: "text-xs",     arrowSize: 18, gap: "gap-3"     },
  lg: { text: "text-4xl",    sub: "text-sm",     arrowSize: 36, gap: "gap-4"     },
  xl: { text: "text-[36px]", sub: "text-base",   arrowSize: 32, gap: "gap-5"     },
};

export const MenuVertical = ({
  menuItems = [],
  skew = 0,
  size = "sm",
}: MenuVerticalProps) => {
  const s = sizeMap[size];

  return (
    <div className={`flex flex-col ${s.gap}`} style={{ width: "fit-content" }}>
      {menuItems.map((item, index) => (
        <motion.div
          key={`${item.label}-${index}`}
          className={`menu-vertical-item${item.active ? " menu-vertical-item--active" : ""}`}
          initial="rest"
          whileHover="hover"
          animate={item.active ? "hover" : "rest"}
          onClick={item.onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") item.onClick?.();
          }}
          aria-current={item.active ? "page" : undefined}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, outline: "none" }}
        >
          {/* Arrow — slides in from left */}
          <motion.div
            variants={{
              rest: { x: -20, opacity: 0 },
              hover: { x: 0, opacity: 1 },
            }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="menu-vertical-arrow"
            style={{ flexShrink: 0, display: "flex" }}
          >
            <ArrowRight size={s.arrowSize} strokeWidth={2.5} />
          </motion.div>

          {/* Text — slides right on hover */}
          <motion.div
            variants={{
              rest:  { x: -6, skewX: 0 },
              hover: { x: 0,  skewX: skew },
            }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}
          >
            <span className={`${s.text} font-semibold leading-tight whitespace-nowrap menu-vertical-label`}>
              {item.label}
            </span>
            {item.sub && (
              <span className={`${s.sub} leading-tight whitespace-nowrap menu-vertical-sub`}>
                {item.sub}
              </span>
            )}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};
