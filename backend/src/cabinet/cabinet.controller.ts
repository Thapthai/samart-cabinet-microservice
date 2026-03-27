import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { CabinetService } from './cabinet.service';
import { CreateCabinetDto, UpdateCabinetDto } from './dto/cabinet.dto';

@Controller('cabinets')
export class CabinetController {
  constructor(private readonly cabinetService: CabinetService) {}

  @Post()
  create(@Body() dto: CreateCabinetDto) {
    return this.cabinetService.createCabinet(dto);
  }

  @Get()
  getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
  ) {
    const query = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      keyword,
    };
    return this.cabinetService.getAllCabinets(query);
  }

  /** รายการประเภทตู้ — ต้องอยู่ก่อน @Get(':id') */
  @Get('types')
  listCabinetTypes() {
    return this.cabinetService.listCabinetTypes();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.cabinetService.getCabinetById(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCabinetDto) {
    return this.cabinetService.updateCabinet(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.cabinetService.deleteCabinet(id);
  }
}
