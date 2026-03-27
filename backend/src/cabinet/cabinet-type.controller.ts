import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CabinetService } from './cabinet.service';
import { CreateCabinetTypeDto, UpdateCabinetTypeDto } from './dto/cabinet-type.dto';

/** CRUD ประเภทตู้ (master) — แยกจาก GET /cabinets/types ที่คัดเฉพาะ active สำหรับ dropdown */
@Controller('cabinet-types')
export class CabinetTypeController {
  constructor(private readonly cabinetService: CabinetService) {}

  @Get()
  listAll() {
    return this.cabinetService.findAllCabinetTypesAdmin();
  }

  @Get(':code')
  getOne(@Param('code') code: string) {
    return this.cabinetService.getCabinetTypeByCode(decodeURIComponent(code));
  }

  @Post()
  create(@Body() dto: CreateCabinetTypeDto) {
    return this.cabinetService.createCabinetType(dto);
  }

  @Put(':code')
  update(@Param('code') code: string, @Body() dto: UpdateCabinetTypeDto) {
    return this.cabinetService.updateCabinetType(decodeURIComponent(code), dto);
  }

  @Delete(':code')
  remove(@Param('code') code: string) {
    return this.cabinetService.deleteCabinetType(decodeURIComponent(code));
  }
}
