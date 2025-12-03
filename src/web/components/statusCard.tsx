import type { ReactNode } from "react";
interface StatsCardProps {
  label: string;
  value: number | string | ReactNode;
  textColor: string; // e.g. "text-green-500" or "text-red-500"
}

export default function StatusCard({
  label,
  value,
  textColor,
}: StatsCardProps) {
  return (
    <div className="bg-white w-2/5 rounded-lg border border-gray-200 py-3 px-6">
      <div className="flex items-center mb-6">
        <span className="text-[#717182] text-sm">{label}</span>
      </div>
      <div className={`${textColor} font-semibold text-2xl`}>{value}</div>
    </div>
  );
}
