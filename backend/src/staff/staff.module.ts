import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { ClientCredentialStrategy } from '../auth/strategies/client-credential.strategy';
import { StaffService } from './staff.service';
import {
  StaffUsersController,
  StaffRolesController,
  StaffRolePermissionsController,
} from './staff.controller';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [
    StaffUsersController,
    StaffRolesController,
    StaffRolePermissionsController,
  ],
  providers: [StaffService, ClientCredentialStrategy],
  exports: [StaffService],
})
export class StaffModule {}
