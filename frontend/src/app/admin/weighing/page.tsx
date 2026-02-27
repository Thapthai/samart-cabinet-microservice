'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { weighingApi, cabinetApi } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import { toast } from 'sonner';
import { Package, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Pagination from '@/components/Pagination';

export interface ItemSlotInCabinetRow {
  id: number;
  itemcode: string;
  StockID: number;
  SlotNo: number;
  Sensor: number;
  Qty: number;
  cabinet?: { id: number; cabinet_name: string | null; cabinet_code: string | null; stock_id: number | null } | null;
  _count?: { itemSlotInCabinetDetail: number };
}

interface CabinetOption {
  id: number;
  cabinet_name?: string | null;
  cabinet_code?: string | null;
  stock_id?: number | null;
}

export default function WeighingPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ItemSlotInCabinetRow[]>([]);
  const [cabinets, setCabinets] = useState<CabinetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCabinets, setLoadingCabinets] = useState(true);
  const [itemcodeFilter, setItemcodeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockIdFilter, setStockIdFilter] = useState<string>('');
  const [selectedStockId, setSelectedStockId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    if (user?.id) {
      fetchCabinets();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchList();
  }, [user?.id, currentPage, itemcodeFilter, stockIdFilter]);

  const fetchCabinets = async () => {
    try {
      setLoadingCabinets(true);
      const res = await cabinetApi.getAll({ page: 1, limit: 200 });
      const data = (res as { success?: boolean; data?: CabinetOption[] }).data;
      const list = Array.isArray(data) ? data : [];
      setCabinets(list.filter((c) => c.stock_id != null));
    } catch {
      setCabinets([]);
    } finally {
      setLoadingCabinets(false);
    }
  };

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await weighingApi.getAll({
        page: currentPage,
        limit: itemsPerPage,
        itemcode: itemcodeFilter || undefined,
        stockId: stockIdFilter ? parseInt(stockIdFilter, 10) : undefined,
      });
      if (res?.success && Array.isArray(res.data)) {
        setItems(res.data);
        setTotalItems(res.pagination?.total ?? res.data.length);
        setTotalPages(res.pagination?.totalPages ?? 1);
      } else {
        setItems([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (e) {
      console.error(e);
      toast.error('โหลดข้อมูลไม่สำเร็จ');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setItemcodeFilter(searchTerm.trim());
    setStockIdFilter(selectedStockId);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setSearchTerm('');
    setItemcodeFilter('');
    setStockIdFilter('');
    setSelectedStockId('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = itemcodeFilter || stockIdFilter;

  return (
    <ProtectedRoute>
      <AppLayout fullWidth>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">สต๊อกอุปกรณ์ในตู้ Weighing</h1>
              <p className="text-sm text-gray-500 mt-1">เมนูสต๊อกอุปกรณ์ที่มีในตู้ Weighing</p>
            </div>
          </div>

          {/* Filter Card — แถว 1: รหัสสินค้า | ตู้ | แถว 2: ค้นหา / ล้าง */}
          <Card className="border-blue-100 bg-gradient-to-br from-slate-50 to-blue-50/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    รหัสสินค้า (itemcode)
                  </label>
                  <Input
                    placeholder="พิมพ์รหัสสินค้า..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full bg-white border-gray-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    ตู้ (Cabinet)
                  </label>
                  <Select
                    value={selectedStockId || 'all'}
                    onValueChange={(v) => setSelectedStockId(v === 'all' ? '' : v)}
                    disabled={loadingCabinets}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-200">
                      <SelectValue placeholder="ทั้งหมด" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      {cabinets.map((c) => (
                        <SelectItem key={c.id} value={String(c.stock_id)}>
                          {c.cabinet_name || c.cabinet_code || `Stock ${c.stock_id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSearch} disabled={loading} className="shadow-sm">
                  <Search className="h-4 w-4 mr-2" />
                  ค้นหา
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="border-gray-300"
                  disabled={!hasActiveFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  ล้าง
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>รายการสต๊อกในตู้ Weighing</CardTitle>
              <span className="text-sm text-muted-foreground">
                ทั้งหมด {totalItems} รายการ
              </span>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
              ) : items.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">ไม่พบข้อมูล</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">ID</TableHead>
                        <TableHead>itemcode</TableHead>
                        <TableHead>ตู้</TableHead>
                        <TableHead>StockID</TableHead>
                        <TableHead>SlotNo</TableHead>
                        <TableHead>Sensor</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-muted-foreground">{row.id}</TableCell>
                          <TableCell className="font-medium">{row.itemcode}</TableCell>
                          <TableCell>
                            {row.cabinet
                              ? row.cabinet.cabinet_name || row.cabinet.cabinet_code || '-'
                              : '-'}
                          </TableCell>
                          <TableCell>{row.StockID}</TableCell>
                          <TableCell>{row.SlotNo}</TableCell>
                          <TableCell>{row.Sensor}</TableCell>
                          <TableCell className="text-right">{row.Qty}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      loading={loading}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
