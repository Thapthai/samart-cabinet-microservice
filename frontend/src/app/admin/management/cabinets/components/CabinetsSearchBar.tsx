'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  loading?: boolean;
  className?: string;
};

export default function CabinetsSearchBar({
  value,
  onValueChange,
  onSearch,
  onClear,
  loading = false,
  className,
}: Props) {
  const showClear = value.length > 0;

  return (
    <form
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-1 shadow-sm shadow-slate-200/40',
        'ring-offset-background transition-shadow focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:ring-offset-2',
        className
      )}
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
    >
      <div className="flex flex-col gap-2 rounded-xl bg-white/90 px-3 py-2.5 sm:flex-row sm:items-stretch sm:gap-2 sm:px-4 sm:py-3 backdrop-blur-sm">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25 sm:mt-0"
            aria-hidden
          >
            <Search className="h-[18px] w-[18px] opacity-95" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <label htmlFor="cabinets-search" className="sr-only">
              ค้นหาตู้
            </label>
            <Input
              id="cabinets-search"
              name="q"
              autoComplete="off"
              placeholder="ค้นหาชื่อตู้, รหัสตู้, หรือประเภท..."
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              className="h-10 border-0 bg-transparent px-0 text-base shadow-none placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm"
            />

          </div>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-center pl-[52px] sm:pl-0">
          {showClear && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              onClick={onClear}
              disabled={loading}
              aria-label="ล้างคำค้นหา"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="h-10 min-w-[96px] rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 font-medium text-white shadow-md shadow-blue-500/20 hover:from-blue-600 hover:to-indigo-700"
          >
            {loading ? 'กำลังโหลด...' : 'ค้นหา'}
          </Button>
        </div>
      </div>
    </form>
  );
}
