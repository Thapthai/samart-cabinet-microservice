'use client';

import { useEffect, useState } from 'react';
import { cabinetApi } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import { toast } from 'sonner';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreateCabinetDialog from './components/CreateCabinetDialog';
import CabinetsSearchBar from './components/CabinetsSearchBar';
import EditCabinetDialog from './components/EditCabinetDialog';
import DeleteCabinetDialog from './components/DeleteCabinetDialog';
import CabinetsTable from './components/CabinetsTable';
import type { ManagementCabinet } from './types';

export default function CabinetsPage() {
  const [cabinets, setCabinets] = useState<ManagementCabinet[]>([]);
  const [loading, setLoading] = useState(true);
  /** ข้อความในช่อง (พิมพ์ได้โดยไม่ยิง API) */
  const [searchInput, setSearchInput] = useState('');
  /** คำค้นที่ใช้กับ API หลังกดค้นหา / Enter */
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCabinet, setSelectedCabinet] = useState<ManagementCabinet | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCabinets();
  }, [currentPage, searchKeyword]);

  const fetchCabinets = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchKeyword.trim()) {
        params.keyword = searchKeyword.trim();
      }

      const response = (await cabinetApi.getAll(params)) as {
        success?: boolean;
        data?: ManagementCabinet[];
        total?: number;
        lastPage?: number;
        message?: string;
      };
      if (response?.success === false) {
        toast.error(response.message || 'โหลดข้อมูลตู้ไม่สำเร็จ');
        setCabinets([]);
        setTotalItems(0);
        setTotalPages(1);
        return;
      }
      if (response?.data) {
        setCabinets(response.data);
        setTotalItems(response.total ?? 0);
        setTotalPages(response.lastPage ?? 1);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch cabinets:', error);
      toast.error('ไม่สามารถโหลดข้อมูลตู้ได้');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (cabinet: ManagementCabinet) => {
    setSelectedCabinet(cabinet);
    setShowEditDialog(true);
  };

  const handleDelete = (cabinet: ManagementCabinet) => {
    setSelectedCabinet(cabinet);
    setShowDeleteDialog(true);
  };

  return (
    <ProtectedRoute>
      <AppLayout fullWidth>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">จัดการตู้ Cabinet</h1>
                <p className="text-sm text-gray-500">จัดการและดูรายการตู้ทั้งหมด</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มตู้ใหม่
            </Button>
          </div>

          <CabinetsSearchBar
            value={searchInput}
            onValueChange={setSearchInput}
            loading={loading}
            onSearch={() => {
              setSearchKeyword(searchInput.trim());
              setCurrentPage(1);
            }}
            onClear={() => {
              setSearchInput('');
              setSearchKeyword('');
              setCurrentPage(1);
            }}
          />

          <CabinetsTable
            cabinets={cabinets}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
          />
        </div>

        <CreateCabinetDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={fetchCabinets}
        />

        <EditCabinetDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          cabinet={selectedCabinet}
          onSuccess={fetchCabinets}
        />

        <DeleteCabinetDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          cabinet={selectedCabinet}
          onSuccess={fetchCabinets}
        />
      </AppLayout>
    </ProtectedRoute>
  );
}
