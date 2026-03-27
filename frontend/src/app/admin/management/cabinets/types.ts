import type { CabinetTypeRow } from '@/lib/api';

export type CabinetTypeDefSummary = Pick<
  CabinetTypeRow,
  'code' | 'name_th' | 'name_en' | 'has_expiry' | 'show_rfid_code' | 'description'
>;

export interface ManagementCabinet {
  id: number;
  cabinet_name?: string | null;
  cabinet_code?: string | null;
  cabinet_type?: string | null;
  stock_id?: number | null;
  cabinet_status?: string | null;
  created_at?: string;
  updated_at?: string;
  cabinetTypeDef?: CabinetTypeDefSummary | null;
}

export function cabinetTypeDisplayLabel(cabinet: ManagementCabinet): string {
  const th = cabinet.cabinetTypeDef?.name_th?.trim();
  if (th) return th;
  const code = cabinet.cabinet_type?.trim();
  return code || '—';
}
