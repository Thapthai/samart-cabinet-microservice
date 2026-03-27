'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StockStatusFilter } from '../items-stock-shared';

export type StockStatusChipDef = { id: StockStatusFilter; label: string };

type Props = {
  chipDefs: StockStatusChipDef[];
  statusFilter: StockStatusFilter;
  onStatusFilterChange: (value: StockStatusFilter) => void;
};

export default function StockStatusChips({ chipDefs, statusFilter, onStatusFilterChange }: Props) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-500">กรองสถานะในหน้านี้</p>
      <div className="flex flex-wrap gap-2">
        {chipDefs.map((c) => {
          const active = statusFilter === c.id;
          return (
            <Button
              key={c.id}
              type="button"
              size="sm"
              variant="outline"
              className={cn(
                'rounded-xl',
                active
                  ? 'border-transparent bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:from-blue-600 hover:to-indigo-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              )}
              onClick={() => onStatusFilterChange(c.id)}
            >
              {c.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
