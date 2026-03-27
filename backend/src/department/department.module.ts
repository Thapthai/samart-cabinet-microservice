import { Module } from '@nestjs/common';
import { DepartmentController, CabinetDepartmentController } from './department.controller';
import { DepartmentService } from './department.service';

@Module({
  controllers: [DepartmentController, CabinetDepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
