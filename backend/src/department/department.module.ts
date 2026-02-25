import { Module } from '@nestjs/common';
import { DepartmentController, CabinetController, CabinetDepartmentController } from './department.controller';
import { DepartmentService } from './department.service';

@Module({
  controllers: [DepartmentController, CabinetController, CabinetDepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
