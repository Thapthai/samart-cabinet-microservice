import { Module } from '@nestjs/common';
import { CabinetController } from './cabinet.controller';
import { CabinetTypeController } from './cabinet-type.controller';
import { CabinetService } from './cabinet.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CabinetController, CabinetTypeController],
  providers: [CabinetService],
  exports: [CabinetService],
})
export class CabinetModule {}
