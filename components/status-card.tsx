import React, { type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon; // Icon component passed from parent
  iconBg: string; // Background color for the icon container
  iconColor: string; // Icon color
  title: string; // e.g., "Visitors Today"
  subtitle?: string; // e.g., "Expected"
  value: string | number |ReactNode; // e.g., 3, 5, .
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  value,
}) => {
  return (
    <div className="flex-1 rounded-xl bg-white  shadow-[0px_0px_3px_0px_#0000001A] border-[#E5E7EB]">
      <div className="md:p-6 px-3 py-2">
        <div className="flex items-start justify-between">
          <div className="md:space-y-3 space-y-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-md ${iconBg}`}
              style={{ backgroundColor: iconBg }}
            >
              <Icon
                className={`${iconColor} h-4 w-4`}
                style={{ color: iconColor }}
              />
            </div>

            <div className="space-y-1">
              <p className="text-[#717182] text-sm md:text-base font-bold">
                {title}
              </p>
              <p className="text-xs text-muted-foreground/70">{subtitle}</p>
            </div>
          </div>
          <p className="font-semi-bold text-xl md:text-3xl">{value}</p>
        </div>
      </div>
    </div>
  );
};
