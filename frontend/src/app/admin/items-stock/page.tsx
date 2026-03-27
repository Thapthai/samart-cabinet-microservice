'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cabinetApi, reportsApi } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import { toast } from 'sonner';
import { Download, Package } from 'lucide-react';
import type { Item } from '@/types/item';
import UpdateMinMaxDialog from '../items/components/UpdateMinMaxDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CabinetStockTabs, {
  cabinetStockTableMode,
  cabinetTypeShowsExpiryFilters,
  pickDefaultCabinet,
  type CabinetTabCabinet,
} from './components/CabinetStockTabs';
import WeighingStockTable from './components/WeighingStockTable';
import RfidStockTable from './components/RfidStockTable';
import ItemsStockFilterBar from './components/ItemsStockFilterBar';
import type { ItemSlotInCabinetRow, StockStatusFilter } from './items-stock-shared';
import { effectiveMax, effectiveMin } from './items-stock-shared';

export type { ItemSlotInCabinetRow, RfidStockLine } from './items-stock-shared';

export default function ItemsStockPage() {
  const { user } = useAuth();
  const [cabinets, setCabinets] = useState<CabinetTabCabinet[]>([]);
  const [loadingCabinets, setLoadingCabinets] = useState(true);
  const [appliedItemName, setAppliedItemName] = useState('');
  const [itemNameDraft, setItemNameDraft] = useState('');
  const [stockIdFilter, setStockIdFilter] = useState('');
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [refetchTick, setRefetchTick] = useState(0);
  const [listLoading, setListLoading] = useState(false);
  const [listStats, setListStats] = useState({
    systemTotal: 0,
    rawOnPage: 0,
    visibleCount: 0,
  });
  const [exportLoading, setExportLoading] = useState<'excel' | 'pdf' | null>(null);
  const [minMaxOpen, setMinMaxOpen] = useState(false);
  const [minMaxRow, setMinMaxRow] = useState<ItemSlotInCabinetRow | null>(null);
  const [statusFilter, setStatusFilter] = useState<StockStatusFilter>('all');

  const rfidExpandResetKey = useMemo(
    () => `${selectedCabinetId ?? ''}:${currentPage}:${refetchTick}`,
    [selectedCabinetId, currentPage, refetchTick],
  );

  useEffect(() => {
    if (user?.id) {
      fetchCabinets();
    }
  }, [user?.id]);

  const fetchCabinets = async () => {
    try {
      setLoadingCabinets(true);
      const res = await cabinetApi.getAll({ page: 1, limit: 200 });
      const data = (res as { success?: boolean; data?: CabinetTabCabinet[] }).data;
      const rawList = Array.isArray(data) ? data : [];
      const sorted = [...rawList].sort((a, b) => {
        const aWeigh = cabinetStockTableMode(a) === 'WEIGHING' ? 0 : 1;
        const bWeigh = cabinetStockTableMode(b) === 'WEIGHING' ? 0 : 1;
        if (aWeigh !== bWeigh) return aWeigh - bWeigh;
        const an = (a.cabinet_name || a.cabinet_code || '').toString();
        const bn = (b.cabinet_name || b.cabinet_code || '').toString();
        return an.localeCompare(bn, 'th');
      });
      const defaultCab = pickDefaultCabinet(sorted);
      setCabinets(sorted);
      setStockIdFilter((prev) => {
        if (prev) return prev;
        return defaultCab?.stock_id != null ? String(defaultCab.stock_id) : '';
      });
      setSelectedCabinetId((prevId) => {
        if (prevId != null) return prevId;
        return defaultCab?.id ?? null;
      });
    } catch {
      setCabinets([]);
    } finally {
      setLoadingCabinets(false);
    }
  };

  const selectedCabinet = useMemo(() => {
    if (selectedCabinetId != null) {
      const byId = cabinets.find((c) => c.id === selectedCabinetId);
      if (byId) return byId;
    }
    if (!stockIdFilter) return null;
    const sid = parseInt(stockIdFilter, 10);
    if (Number.isNaN(sid)) return null;
    return (
      cabinets.find((c) => c.stock_id != null && Number(c.stock_id) === sid) ?? null
    );
  }, [cabinets, selectedCabinetId, stockIdFilter]);

  const tableMode = useMemo(() => cabinetStockTableMode(selectedCabinet), [selectedCabinet]);

  useEffect(() => {
    setListStats({ systemTotal: 0, rawOnPage: 0, visibleCount: 0 });
  }, [tableMode]);

  const showExpiryStatusChips = useMemo(
    () => cabinetTypeShowsExpiryFilters(selectedCabinet),
    [selectedCabinet],
  );

  useEffect(() => {
    setStatusFilter((prev) => {
      if (!showExpiryStatusChips && (prev === 'expired' || prev === 'soon')) return 'all';
      return prev;
    });
  }, [showExpiryStatusChips]);

  const chipDefs = useMemo(() => {
    const base: { id: StockStatusFilter; label: string }[] = [{ id: 'all', label: 'ทั้งหมด' }];
    if (showExpiryStatusChips) {
      base.push({ id: 'expired', label: 'หมดอายุ' }, { id: 'soon', label: 'ใกล้หมด' });
    }
    base.push({ id: 'low', label: 'สต็อกต่ำ' });
    return base;
  }, [showExpiryStatusChips]);

  const stockIdParsed = useMemo(() => {
    if (!stockIdFilter) return null;
    const n = parseInt(stockIdFilter, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [stockIdFilter]);

  const handleSearch = () => {
    setAppliedItemName(itemNameDraft.trim());
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setItemNameDraft('');
    setAppliedItemName('');
    setCurrentPage(1);
  };

  const handleSelectCabinet = (c: CabinetTabCabinet) => {
    if (c.stock_id == null || Number(c.stock_id) <= 0) return;
    setSelectedCabinetId(c.id);
    setStockIdFilter(String(c.stock_id));
    setCurrentPage(1);
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const rowToDialogItem = (row: ItemSlotInCabinetRow): Item =>
    ({
      itemcode: row.itemcode,
      itemname: row.item?.itemname ?? row.item?.Alternatename,
      stock_min: effectiveMin(row) ?? 0,
      stock_max: effectiveMax(row) ?? 0,
      stock_balance: row.Qty,
    }) as Item;

  const openMinMaxDialog = (row: ItemSlotInCabinetRow) => {
    if (!row.cabinet?.id) {
      toast.error('ไม่พบข้อมูลตู้สำหรับรายการนี้');
      return;
    }
    setMinMaxRow(row);
    setMinMaxOpen(true);
  };

  const handleDownloadWeighingStockExcel = async () => {
    try {
      setExportLoading('excel');
      const stockId = stockIdFilter ? parseInt(stockIdFilter, 10) : undefined;
      const itemName = appliedItemName.trim() || undefined;
      await reportsApi.downloadWeighingStockExcel({ stockId, itemName, statusFilter });
      toast.success('ดาวน์โหลดรายงาน Excel สำเร็จ');
    } catch (e) {
      console.error(e);
      toast.error('ดาวน์โหลดรายงานไม่สำเร็จ');
    } finally {
      setExportLoading(null);
    }
  };

  const handleDownloadWeighingStockPdf = async () => {
    try {
      setExportLoading('pdf');
      const stockId = stockIdFilter ? parseInt(stockIdFilter, 10) : undefined;
      const itemName = appliedItemName.trim() || undefined;
      await reportsApi.downloadWeighingStockPdf({ stockId, itemName });
      toast.success('ดาวน์โหลดรายงาน PDF สำเร็จ');
    } catch (e) {
      console.error(e);
      toast.error('ดาวน์โหลดรายงานไม่สำเร็จ');
    } finally {
      setExportLoading(null);
    }
  };

  const handleDownloadCabinetStockExcel = async () => {
    if (selectedCabinetId == null) {
      toast.error('เลือกตู้ RFID ก่อนดาวน์โหลดรายงาน');
      return;
    }
    try {
      setExportLoading('excel');
      await reportsApi.downloadCabinetStockExcel({
        cabinetId: selectedCabinetId,
        cabinetCode: selectedCabinet?.cabinet_code ?? undefined,
        keyword: appliedItemName.trim() || undefined,
        statusFilter,
      });
      toast.success('ดาวน์โหลดรายงาน Excel (ตู้ RFID) สำเร็จ');
    } catch (e) {
      console.error(e);
      toast.error('ดาวน์โหลดรายงานไม่สำเร็จ');
    } finally {
      setExportLoading(null);
    }
  };

  const handleDownloadCabinetStockPdf = async () => {
    if (selectedCabinetId == null) {
      toast.error('เลือกตู้ RFID ก่อนดาวน์โหลดรายงาน');
      return;
    }
    try {
      setExportLoading('pdf');
      await reportsApi.downloadCabinetStockPdf({
        cabinetId: selectedCabinetId,
        cabinetCode: selectedCabinet?.cabinet_code ?? undefined,
        keyword: appliedItemName.trim() || undefined,
        statusFilter,
      });
      toast.success('ดาวน์โหลดรายงาน PDF (ตู้ RFID) สำเร็จ');
    } catch (e) {
      console.error(e);
      toast.error('ดาวน์โหลดรายงานไม่สำเร็จ');
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout fullWidth>
        <UpdateMinMaxDialog
          open={minMaxOpen}
          onOpenChange={(open) => {
            setMinMaxOpen(open);
            if (!open) setMinMaxRow(null);
          }}
          item={minMaxRow ? rowToDialogItem(minMaxRow) : null}
          cabinetId={minMaxRow?.cabinet?.id}
          minMaxEndpoint="weighing"
          onSuccess={() => {
            setRefetchTick((t) => t + 1);
          }}
        />
        <div className="w-full max-w-full space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">สต๊อกอุปกรณ์ตามตู้</h1>
                <p className="text-sm text-gray-500">
                  เลือกตู้ — ตู้ชั่งแสดงช่อง/สล็อต ตู้ RFID แสดงวันหมดอายุและแท็ก
                </p>
              </div>
            </div>
          </div>

          <Card className="rounded-xl border-slate-200/80 shadow-sm">

            <CardContent className="pt-0">
              <CabinetStockTabs
                cabinets={cabinets}
                selectedCabinetId={selectedCabinetId}
                onSelectCabinet={handleSelectCabinet}
                loading={loadingCabinets}
              />
            </CardContent>
          </Card>

          <ItemsStockFilterBar
            keywordDraft={itemNameDraft}
            onKeywordDraftChange={setItemNameDraft}
            appliedKeyword={appliedItemName}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            listLoading={listLoading}
          />

          <Card className="rounded-xl border-slate-200/80 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
              <div className="space-y-1.5">
                <CardTitle>
                  {tableMode === 'RFID' ? 'รายการในตู้ (RFID)' : 'รายการในตู้ (Weighing)'}
                </CardTitle>
                <CardDescription>
                  ทั้งหมด {listStats.systemTotal} รายการจากระบบ
                  {tableMode === 'WEIGHING' && (
                    <span className="hidden sm:inline"> · รายงาน: สต๊อกตู้ชั่ง (Weighing)</span>
                  )}
                  {tableMode === 'RFID' && (
                    <span className="hidden sm:inline"> · รายงาน: สต๊อกในตู้ (Cabinet / RFID)</span>
                  )}
                </CardDescription>
              </div>
              {tableMode === 'WEIGHING' ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadWeighingStockExcel}
                    disabled={exportLoading !== null}
                  >
                    <Download className="mr-1.5 h-4 w-4" />
                    {exportLoading === 'excel' ? 'กำลังโหลด...' : 'Excel ตู้ชั่ง'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadWeighingStockPdf}
                    disabled={exportLoading !== null}
                  >
                    <Download className="mr-1.5 h-4 w-4" />
                    {exportLoading === 'pdf' ? 'กำลังโหลด...' : 'PDF ตู้ชั่ง'}
                  </Button>
                </div>
              ) : tableMode === 'RFID' && selectedCabinetId != null ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCabinetStockExcel}
                    disabled={exportLoading !== null}
                  >
                    <Download className="mr-1.5 h-4 w-4" />
                    {exportLoading === 'excel' ? 'กำลังโหลด...' : 'Excel ตู้ RFID'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCabinetStockPdf}
                    disabled={exportLoading !== null}
                  >
                    <Download className="mr-1.5 h-4 w-4" />
                    {exportLoading === 'pdf' ? 'กำลังโหลด...' : 'PDF ตู้ RFID'}
                  </Button>
                </div>
              ) : null}
            </CardHeader>
            <CardContent className="px-4">
              {tableMode === 'WEIGHING' ? (
                <WeighingStockTable
                  stockId={stockIdParsed}
                  appliedItemName={appliedItemName}
                  statusFilter={statusFilter}
                  chipDefs={chipDefs}
                  onStatusFilterChange={setStatusFilter}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onManage={openMinMaxDialog}
                  refetchSignal={refetchTick}
                  onLoadingChange={setListLoading}
                  onStatsChange={setListStats}
                />
              ) : tableMode === 'RFID' ? (
                <RfidStockTable
                  cabinetId={selectedCabinetId}
                  stockId={stockIdParsed}
                  cabinetName={selectedCabinet?.cabinet_name ?? null}
                  cabinetCode={selectedCabinet?.cabinet_code ?? null}
                  appliedItemName={appliedItemName}
                  statusFilter={statusFilter}
                  chipDefs={chipDefs}
                  onStatusFilterChange={setStatusFilter}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onManage={openMinMaxDialog}
                  resetExpandSignal={rfidExpandResetKey}
                  refetchSignal={refetchTick}
                  onLoadingChange={setListLoading}
                  onStatsChange={setListStats}
                />
              ) : (
                <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/80 text-sm text-gray-500">
                  เลือกตู้เพื่อแสดงรายการ
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
