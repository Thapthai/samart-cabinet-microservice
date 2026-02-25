import { Module } from '@nestjs/common';
import {
  MedicalSupplyUsageController,
  MedicalSupplyItemController,
  MedicalSupplyController,
} from './medical-supplies.controller';
import { MedicalSuppliesService } from './medical-supplies.service';

@Module({
  controllers: [
    MedicalSupplyUsageController,
    MedicalSupplyItemController,
    MedicalSupplyController,
  ],
  providers: [MedicalSuppliesService],
  exports: [MedicalSuppliesService],
})
export class MedicalSuppliesModule {}
