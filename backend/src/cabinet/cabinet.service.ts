import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCabinetDto, UpdateCabinetDto } from './dto/cabinet.dto';
import { CreateCabinetTypeDto, UpdateCabinetTypeDto } from './dto/cabinet-type.dto';

@Injectable()
export class CabinetService {
  private readonly logger = new Logger(CabinetService.name);
  private readonly HOSPITAL_PREFIX = 'VTN';

  constructor(private prisma: PrismaService) {}

  private async resolveCabinetTypeForWrite(
    raw: string | null | undefined,
  ): Promise<{ value?: string | null; error?: string }> {
    if (raw === undefined) return {};
    const t = typeof raw === 'string' ? raw.trim() : '';
    if (t === '') return { value: null };
    const upper = t.toUpperCase();
    const row = await this.prisma.cabinetType.findUnique({
      where: { code: upper },
      select: { code: true, is_active: true },
    });
    if (!row) {
      return {
        error: `ไม่พบประเภทตู้ "${raw}" ในระบบ กรุณาเลือกจากรายการที่กำหนดไว้`,
      };
    }
    if (!row.is_active) {
      return { error: `ประเภทตู้ ${upper} ถูกปิดใช้งาน` };
    }
    return { value: upper };
  }

  private cabinetTypeInclude() {
    return {
      select: {
        code: true,
        name_th: true,
        name_en: true,
        has_expiry: true,
        show_rfid_code: true,
        description: true,
      },
    } as const;
  }

  async listCabinetTypes() {
    try {
      const data = await this.prisma.cabinetType.findMany({
        where: { is_active: true },
        orderBy: [{ sort_order: 'asc' }, { code: 'asc' }],
        select: {
          code: true,
          name_th: true,
          name_en: true,
          has_expiry: true,
          show_rfid_code: true,
          description: true,
          sort_order: true,
        },
      });
      return { success: true, data };
    } catch (err: any) {
      this.logger.error(`listCabinetTypes failed: ${err?.message ?? err}`);
      return { success: false, message: 'ไม่สามารถโหลดประเภทตู้ได้', data: [] };
    }
  }

  private async generateCabinetCode(options: {
    hospitalPrefix?: string;
    department_id?: number;
    stock_id?: number;
  }): Promise<{ cabinet_code: string; stock_id: number }> {
    const prefix = options.hospitalPrefix ?? this.HOSPITAL_PREFIX;
    let refDepId = '';
    if (options.department_id) {
      const dept = await this.prisma.department.findUnique({
        where: { ID: options.department_id },
        select: { RefDepID: true },
      });
      if (dept?.RefDepID?.trim()) refDepId = dept.RefDepID.trim().toUpperCase();
    }
    let stock_id: number;
    if (options.stock_id != null && options.stock_id > 0) {
      stock_id = options.stock_id;
    } else {
      const maxStock = await this.prisma.cabinet.findFirst({
        where: { stock_id: { not: null } },
        select: { stock_id: true },
        orderBy: { stock_id: 'desc' },
      });
      stock_id = (maxStock?.stock_id ?? 0) + 1;
    }
    const segment = refDepId ? `${prefix}-${refDepId}` : prefix;
    const cabinet_code = `${segment}-${String(stock_id).padStart(3, '0')}`;
    return { cabinet_code, stock_id };
  }

  async createCabinet(data: CreateCabinetDto) {
    try {
      const { department_id, cabinet_type: rawCabinetType, ...rest } = data;
      const typeResolved = await this.resolveCabinetTypeForWrite(rawCabinetType);
      if (typeResolved.error) {
        return { success: false, message: typeResolved.error };
      }
      let cabinet_code = data.cabinet_code?.trim();
      let stock_id = data.stock_id;
      if (!cabinet_code || stock_id == null) {
        const generated = await this.generateCabinetCode({
          hospitalPrefix: this.HOSPITAL_PREFIX,
          department_id,
          stock_id: stock_id ?? undefined,
        });
        if (!cabinet_code) cabinet_code = generated.cabinet_code;
        if (stock_id == null) stock_id = generated.stock_id;
      }
      const cabinet = await this.prisma.cabinet.create({
        data: {
          cabinet_name: rest.cabinet_name ?? null,
          cabinet_code,
          stock_id,
          cabinet_status: department_id ? 'USED' : (rest.cabinet_status ?? null),
          ...(typeResolved.value !== undefined ? { cabinet_type: typeResolved.value } : {}),
        },
      });
      if (department_id) {
        const department = await this.prisma.department.findUnique({
          where: { ID: department_id },
        });
        if (department) {
          await this.prisma.cabinetDepartment.create({
            data: { cabinet_id: cabinet.id, department_id, status: 'ACTIVE' },
          });
        }
      }
      const cabinetWithDepts = await this.prisma.cabinet.findUnique({
        where: { id: cabinet.id },
        include: {
          cabinetDepartments: {
            select: {
              id: true,
              department_id: true,
              status: true,
              department: { select: { ID: true, DepName: true, DepName2: true } },
            },
          },
          cabinetTypeDef: this.cabinetTypeInclude(),
        },
      });
      return { success: true, message: 'Cabinet created successfully', data: cabinetWithDepts ?? cabinet };
    } catch (err: any) {
      this.logger.error(`Error creating cabinet: ${err.message}`);
      return { success: false, message: 'Failed to create cabinet', error: err.message };
    }
  }

  async getAllCabinets(query?: { page?: number; limit?: number; keyword?: string }) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;
    const where: Prisma.cabinetWhereInput = {};
    const kw = typeof query?.keyword === 'string' ? query.keyword.trim() : '';
    if (kw) {
      where.OR = [
        { cabinet_name: { contains: kw } },
        { cabinet_code: { contains: kw } },
        { cabinet_type: { contains: kw } },
        {
          cabinetTypeDef: {
            is: {
              OR: [{ name_th: { contains: kw } }, { code: { contains: kw } }],
            },
          },
        },
      ];
    }
    const [cabinets, total] = await Promise.all([
      this.prisma.cabinet.findMany({
        where,
        skip,
        take: limit,
        include: {
          cabinetDepartments: {
            select: {
              id: true,
              department_id: true,
              status: true,
              department: { select: { ID: true, DepName: true, DepName2: true } },
            },
          },
          cabinetTypeDef: this.cabinetTypeInclude(),
        },
      }),
      this.prisma.cabinet.count({ where }),
    ]);
    return { success: true, data: cabinets, total, page, limit, lastPage: Math.ceil(total / limit) };
  }

  async getCabinetById(id: number) {
    const cabinet = await this.prisma.cabinet.findUnique({
      where: { id },
      include: { cabinetTypeDef: this.cabinetTypeInclude() },
    });
    return { success: true, data: cabinet };
  }

  async updateCabinet(id: number, data: UpdateCabinetDto) {
    try {
      const patch: Prisma.cabinetUpdateInput = {};
      if (data.cabinet_name !== undefined) patch.cabinet_name = data.cabinet_name;
      if (data.cabinet_code !== undefined) patch.cabinet_code = data.cabinet_code;
      if (data.cabinet_status !== undefined) patch.cabinet_status = data.cabinet_status;
      if (data.stock_id !== undefined) patch.stock_id = data.stock_id;
      if (data.cabinet_type !== undefined) {
        const r = await this.resolveCabinetTypeForWrite(data.cabinet_type);
        if (r.error) return { success: false, message: r.error };
        patch.cabinetTypeDef =
          r.value == null ? { disconnect: true } : { connect: { code: r.value } };
      }
      const cabinet = await this.prisma.cabinet.update({
        where: { id },
        data: patch,
        include: {
          cabinetDepartments: {
            select: {
              id: true,
              department_id: true,
              status: true,
              department: { select: { ID: true, DepName: true, DepName2: true } },
            },
          },
          cabinetTypeDef: this.cabinetTypeInclude(),
        },
      });
      return { success: true, message: 'Cabinet updated successfully', data: cabinet };
    } catch (err: any) {
      this.logger.error(`Error updating cabinet: ${err.message}`);
      return { success: false, message: 'Failed to update cabinet', error: err.message };
    }
  }

  async deleteCabinet(id: number) {
    try {
      await this.prisma.cabinet.delete({ where: { id } });
      return { success: true, message: 'Cabinet deleted successfully' };
    } catch (err: any) {
      this.logger.error(`Error deleting cabinet: ${err.message}`);
      return { success: false, message: 'Failed to delete cabinet', error: err.message };
    }
  }

  // --- จัดการ master ประเภทตู้ (admin) ---

  async findAllCabinetTypesAdmin() {
    try {
      const data = await this.prisma.cabinetType.findMany({
        orderBy: [{ sort_order: 'asc' }, { code: 'asc' }],
      });
      return { success: true, data };
    } catch (err: any) {
      this.logger.error(`findAllCabinetTypesAdmin: ${err?.message ?? err}`);
      return { success: false, message: 'โหลดประเภทตู้ไม่สำเร็จ', data: [] };
    }
  }

  async getCabinetTypeByCode(code: string) {
    const row = await this.prisma.cabinetType.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    if (!row) return { success: false, message: 'ไม่พบประเภทตู้', data: null };
    return { success: true, data: row };
  }

  async createCabinetType(dto: CreateCabinetTypeDto) {
    try {
      const code = dto.code.trim().toUpperCase();
      if (!code) return { success: false, message: 'กรุณาระบุรหัสประเภท' };
      const dup = await this.prisma.cabinetType.findUnique({ where: { code } });
      if (dup) return { success: false, message: `รหัส ${code} มีอยู่แล้ว` };
      const row = await this.prisma.cabinetType.create({
        data: {
          code,
          name_th: dto.name_th?.trim() || null,
          name_en: dto.name_en?.trim() || null,
          has_expiry: dto.has_expiry ?? true,
          show_rfid_code: dto.show_rfid_code ?? false,
          description: dto.description?.trim() || null,
          sort_order: dto.sort_order ?? 0,
          is_active: dto.is_active ?? true,
        },
      });
      return { success: true, message: 'สร้างประเภทตู้แล้ว', data: row };
    } catch (err: any) {
      this.logger.error(`createCabinetType: ${err?.message ?? err}`);
      return { success: false, message: err?.message ?? 'สร้างไม่สำเร็จ' };
    }
  }

  async updateCabinetType(codeRaw: string, dto: UpdateCabinetTypeDto) {
    try {
      const code = codeRaw.trim().toUpperCase();
      const exists = await this.prisma.cabinetType.findUnique({ where: { code } });
      if (!exists) return { success: false, message: 'ไม่พบประเภทตู้' };
      const row = await this.prisma.cabinetType.update({
        where: { code },
        data: {
          ...(dto.name_th !== undefined ? { name_th: dto.name_th?.trim() || null } : {}),
          ...(dto.name_en !== undefined ? { name_en: dto.name_en?.trim() || null } : {}),
          ...(dto.has_expiry !== undefined ? { has_expiry: dto.has_expiry } : {}),
          ...(dto.show_rfid_code !== undefined ? { show_rfid_code: dto.show_rfid_code } : {}),
          ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
          ...(dto.sort_order !== undefined ? { sort_order: dto.sort_order } : {}),
          ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
        },
      });
      return { success: true, message: 'อัปเดตแล้ว', data: row };
    } catch (err: any) {
      this.logger.error(`updateCabinetType: ${err?.message ?? err}`);
      return { success: false, message: err?.message ?? 'อัปเดตไม่สำเร็จ' };
    }
  }

  async deleteCabinetType(codeRaw: string) {
    try {
      const code = codeRaw.trim().toUpperCase();
      await this.prisma.cabinetType.delete({ where: { code } });
      return { success: true, message: 'ลบประเภทตู้แล้ว' };
    } catch (err: any) {
      if (err?.code === 'P2003') {
        return {
          success: false,
          message: 'ลบไม่ได้: ยังมีตู้ที่อ้างถึงประเภทนี้อยู่',
        };
      }
      this.logger.error(`deleteCabinetType: ${err?.message ?? err}`);
      return { success: false, message: err?.message ?? 'ลบไม่สำเร็จ' };
    }
  }
}
