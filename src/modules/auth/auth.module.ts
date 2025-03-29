import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '@modules/token/entities/token.entity';
import { User } from '@modules/user/entities/user.entity';
import { OtpService } from './otp/otp.service';
import { Otp } from './otp/entities/otp.entity';
import { RoleSectionPermission } from '@shared/entities/role.section.permission.entity';
import { EmailService } from '@shared/service/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token, User, Otp, RoleSectionPermission]),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, EmailService],
})
export class AuthModule {}
