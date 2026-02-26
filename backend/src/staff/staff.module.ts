import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ClientCredentialStrategy } from '../auth/strategies/client-credential.strategy';
import { StaffService } from './staff.service';
import {
  StaffUsersController,
  StaffRolesController,
  StaffRolePermissionsController,
} from './staff.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    StaffUsersController,
    StaffRolesController,
    StaffRolePermissionsController,
  ],
  providers: [StaffService, ClientCredentialStrategy],
  exports: [StaffService],
})
export class StaffModule {}
