import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
  disabled = false,
}: SearchBarProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className='absolute left-3 w-[12px] h-[12px] text-[#99A1AF] pointer-events-none' />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-[43px] w-full pl-8 pr-3 text-[14px] border-gray-200 rounded-[8px]"
      />
    </div>
  );
}



