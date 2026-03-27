'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CabinetTypeRow } from '@/lib/api';

const NONE = '__none__';

type Props = {
  id?: string;
  value: string;
  onValueChange: (code: string) => void;
  types: CabinetTypeRow[];
  allowNone?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export default function CabinetTypeSelect({
  id,
  value,
  onValueChange,
  types,
  allowNone = false,
  disabled = false,
  placeholder = 'เลือกประเภทตู้',
}: Props) {
  const selectValue =
    allowNone && value === '' ? NONE : value === '' ? undefined : value;

  return (
    <Select
      value={selectValue}
      onValueChange={(v) => onValueChange(v === NONE ? '' : v)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowNone && (
          <SelectItem value={NONE}>— ไม่ระบุ —</SelectItem>
        )}
        {types.map((t) => (
          <SelectItem key={t.code} value={t.code}>
            <span>
              {t.name_th?.trim() || t.code}
              <span className="text-muted-foreground"> ({t.code})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
