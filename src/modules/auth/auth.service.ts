import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { MESSAGE } from '@shared/constants/constant';
import { User } from '@modules/user/entities/user.entity';
import { Token } from '@modules/token/entities/token.entity';
import * as jwt from 'jsonwebtoken';
import { IJwtPayload } from '@shared/constants/types';
import { OtpService } from './otp/otp.service';
import { expiryTime, OtpType } from '@shared/constants/enum';
import hashPassword from '@shared/function/hash-password';
import comparePassword from '@shared/function/compare-password';
import { RoleSectionPermission } from '@shared/entities/role.section.permission.entity';
import { EmailService } from '@shared/service/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RoleSectionPermission)
    private readonly roleSectionPermissionRepository: Repository<RoleSectionPermission>,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto, ip: string) {
    const user = await this.userRepository.findOne({
      where: {
        email: loginDto.email,
      },
      relations: { role: true },
    });

    // User not exists
    if (!user) {
      throw new BadRequestException(MESSAGE.WRONG_CREDENTIALS);
    }

    const isCorrectPassword = await comparePassword(
      loginDto.password,
      user.password,
    );

    // Wrong Password
    if (!isCorrectPassword) {
      throw new BadRequestException(MESSAGE.WRONG_CREDENTIALS);
    }

    const loginResponse = await this.getLoginResponse(
      user,
      loginDto.device_id,
      ip,
    );
    return { message: MESSAGE.LOGIN, data: loginResponse };
  }

  async getToken(user: User, deviceId: string, ip: string): Promise<string> {
    const token = await this.tokenRepository.findOne({
      where: {
        user: { id: user.id },
        device_id: deviceId,
      },
    });

    // generate token
    const newToken = await this.generateToken({ id: user.id });

    if (token) {
      const isExpired = await this.isTokenExpired(token.jwt);

      if (isExpired) {
        // Update with new token
        await this.tokenRepository.save({
          id: token.id,
          token: newToken,
          ip: ip,
          login_time: new Date().toISOString(),
        });
        // New Token
        return newToken;
      }

      // Update Login Time
      await this.tokenRepository.save({
        id: token.id,
        ip: ip,
        login_time: new Date().toISOString(),
      });
      // Old token which is not expired
      return token.jwt;
    }

    // Create new token
    const result = await this.tokenRepository.save({
      user: { id: user.id },
      jwt: newToken,
      device_id: deviceId,
      ip: ip,
      login_time: new Date().toISOString(),
    });
    return result.jwt;
  }

  generateToken = (payload: IJwtPayload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  };

  async getLoginResponse(user: User, deviceId: string, ip: string) {
    const permission = await this.getSectionAndPermissionByRoleId(user.role.id);
    const jwt = await this.getToken(user, deviceId, ip);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        role: user.role.name,
        section: permission,
      },
      jwt,
    };
  }

  isTokenExpired = async (token: string) => {
    try {
      const valid = await jwt.verify(token, process.env.JWT_SECRET);
      if (valid) {
        return false;
      } else {
        return true;
      }
    } catch (err) {
      return true;
    }
  };

  async logout(user: User, token: string, ip: string) {
    const time = new Date().toISOString();
    const result = await this.tokenRepository.update(
      { user: { id: user.id }, jwt: token, deleted_at: IsNull() },
      {
        jwt: 'logged out',
        logout_time: time,
        ip: ip,
        deleted_at: time,
      },
    );
    return result.affected ? MESSAGE.LOGOUT : MESSAGE.METHOD_NOT_ALLOWED;
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });
    if (!user) {
      return;
    }
    const expireAt = new Date();
    const otp = this.otpService.generateOtp();
    expireAt.setMinutes(expireAt.getMinutes() + expiryTime.TEN_MIN);

    const userOtp = await this.otpService.findOneWhere({
      where: {
        user: { id: user.id },
      },
    });

    if (!userOtp) {
      await this.otpService.save({
        otp: otp,
        expire_at: expireAt,
        type: OtpType.FORGOT_PASSWORD,
        user: { id: user.id },
      });
    } else {
      const expireAt = new Date();
      expireAt.setMinutes(expireAt.getMinutes() + expiryTime.TEN_MIN);
      const updateOtp = {
        otp: otp,
        expire_at: expireAt,
        is_verified: false,
      };

      await this.otpService.update(userOtp.id, updateOtp);
    }
    await this.emailService.sendOtpEmail(user.email, otp, expiryTime.TEN_MIN);
  }

  async resetPassword(email: string, otp: number, password: string) {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });
    if (!user) {
      throw new BadRequestException(MESSAGE.METHOD_NOT_ALLOWED);
    }
    const validOtp = await this.otpService.findOneWhere({
      where: {
        otp: otp,
        user: { id: user.id },
        is_verified: false,
      },
    });
    if (!validOtp) {
      throw new BadRequestException(MESSAGE.INVALID_OTP);
    }
    const isExpired =
      new Date(validOtp.expire_at).getTime() < new Date().getTime();
    if (isExpired) {
      await this.otpService.remove(validOtp.id);
      throw new BadRequestException(MESSAGE.OTP_EXPIRED);
    }
    await this.otpService.update(validOtp.id, { is_verified: true });
    const hashedPassword = await hashPassword(password);
    await this.userRepository.update(user.id, { password: hashedPassword });
  }

  async getSectionAndPermissionByRoleId(id: string) {
    const result = await this.roleSectionPermissionRepository
      .createQueryBuilder('rsp')
      .select(['s.name AS name', 'JSON_AGG(p.name) AS permission'])
      .innerJoin('section', 's', 's.id = rsp.section_id')
      .innerJoin('permission', 'p', 'p.id = rsp.permission_id')
      .where('rsp.role_id = :id AND rsp.has_access = true', { id })
      .groupBy('s.name')
      .getRawMany();
    return result;
  }
}
