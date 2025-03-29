import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '@modules/token/entities/token.entity';
import { User } from '@modules/user/entities/user.entity';
import { Otp } from '@modules/auth/otp/entities/otp.entity';
import { RoleSectionPermission } from '@shared/entities/role.section.permission.entity';
import { Availability } from './entities/availability.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token, User, Otp, RoleSectionPermission,Availability]),
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
