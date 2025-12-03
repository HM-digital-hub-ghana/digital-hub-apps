import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
}

export function StatsCard({ label, value, icon: Icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm">{label}</span>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="text-gray-900">{value}</div>
    </div>
  );
}
