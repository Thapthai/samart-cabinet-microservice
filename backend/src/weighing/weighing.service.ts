import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WeighingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ดึงรายการ ItemSlotInCabinet แบบแบ่งหน้า (รวม relation cabinet)
   */
  async findAll(params: { page?: number; limit?: number; itemcode?: string; stockId?: number }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    const where: { itemcode?: { contains: string }; StockID?: number } = {};
    if (params.itemcode?.trim()) {
      where.itemcode = { contains: params.itemcode.trim() };
    }
    if (params.stockId != null && params.stockId > 0) {
      where.StockID = params.stockId;
    }

    const [items, total] = await Promise.all([
      this.prisma.itemSlotInCabinet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
        include: {
          _count: { select: { itemSlotInCabinetDetail: true } },
          cabinet: { select: { id: true, cabinet_name: true, cabinet_code: true, stock_id: true } },
        },
      }),
      this.prisma.itemSlotInCabinet.count({ where }),
    ]);

    return {
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * ดึงหนึ่งรายการตาม itemcode (รวม detail count)
   */
  async findByItemcode(itemcode: string) {
    const item = await this.prisma.itemSlotInCabinet.findUnique({
      where: { itemcode },
      include: {
        _count: { select: { itemSlotInCabinetDetail: true } },
      },
    });
    if (!item) throw new NotFoundException('Item slot not found');
    return { success: true, data: item };
  }

  /**
   * ดึงรายการ ItemSlotInCabinetDetail ตาม itemcode
   */
  async findDetailsByItemcode(
    itemcode: string,
    params: { page?: number; limit?: number } = {},
  ) {
    const slot = await this.prisma.itemSlotInCabinet.findUnique({
      where: { itemcode },
    });
    if (!slot) throw new NotFoundException('Item slot not found');

    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    const [details, total] = await Promise.all([
      this.prisma.itemSlotInCabinetDetail.findMany({
        where: { itemcode },
        skip,
        take: limit,
        orderBy: { ModifyDate: 'desc' },
      }),
      this.prisma.itemSlotInCabinetDetail.count({ where: { itemcode } }),
    ]);

    return {
      success: true,
      data: details,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * ดึงรายการ ItemSlotInCabinetDetail แบบแบ่งหน้า ตาม Sign (เบิก = '-', เติม = '+')
   */
  async findDetailsBySign(
    sign: string,
    params: { page?: number; limit?: number; itemcode?: string; stockId?: number } = {},
  ) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    const where: { Sign: string; itemcode?: { contains: string }; StockID?: number } = {
      Sign: sign === '+' ? '+' : '-',
    };
    if (params.itemcode?.trim()) {
      where.itemcode = { contains: params.itemcode.trim() };
    }
    if (params.stockId != null && params.stockId > 0) {
      where.StockID = params.stockId;
    }

    const [details, total] = await Promise.all([
      this.prisma.itemSlotInCabinetDetail.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ModifyDate: 'desc' },
      }),
      this.prisma.itemSlotInCabinetDetail.count({ where }),
    ]);

    return {
      success: true,
      data: details,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
