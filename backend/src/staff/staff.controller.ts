import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import {
  CreateStaffUserDto,
  UpdateStaffUserDto,
  RegenerateClientSecretDto,
} from '../auth/dto/staff-user.dto';
import { CreateStaffRoleDto, UpdateStaffRoleDto } from '../auth/dto/staff-role.dto';
import { BulkUpdateStaffRolePermissionsDto } from '../auth/dto/staff-role-permission.dto';

@Controller('staff-users')
export class StaffUsersController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
  ) {
    const params = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      keyword: keyword?.trim() || undefined,
    };
    return this.staffService.findAllStaffUsers(params);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.findOneStaffUser(id);
  }

  @Post()
  async create(@Body() dto: CreateStaffUserDto) {
    return this.staffService.createStaffUser(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffUserDto,
  ) {
    return this.staffService.updateStaffUser(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.deleteStaffUser(id);
  }

  @Post(':id/regenerate-secret')
  async regenerateSecret(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegenerateClientSecretDto,
  ) {
    return this.staffService.regenerateClientSecret(id, dto);
  }
}

@Controller('staff-roles')
export class StaffRolesController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async findAll() {
    return this.staffService.findAllStaffRoles();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.findOneStaffRole(id);
  }

  @Post()
  async create(@Body() dto: CreateStaffRoleDto) {
    return this.staffService.createStaffRole(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffRoleDto,
  ) {
    return this.staffService.updateStaffRole(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.deleteStaffRole(id);
  }
}

@Controller('staff-role-permissions')
export class StaffRolePermissionsController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async findAll() {
    return this.staffService.findAllStaffRolePermissions();
  }

  @Put('bulk')
  async bulkUpdate(@Body() dto: BulkUpdateStaffRolePermissionsDto) {
    const list = (dto.permissions ?? []).map((p) => ({
      role_code: p.role_code,
      role_id: p.role_id,
      menu_href: p.menu_href,
      can_access: p.can_access ?? true,
    }));
    return this.staffService.bulkUpdateStaffRolePermissions(list);
  }
}
