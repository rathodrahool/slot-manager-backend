import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import getIp from '@shared/function/get-ip';
import response from '@shared/response';
import { JoiValidationPipe } from 'src/core/pipes/joi-validation.pipe';
import { loginJoi } from './joi/login.schema';
import { AuthGuard } from 'src/core/guard/auth.guard';
import { ForgetPasswordDto } from './dto/forgot.password.dto';
import { MESSAGE } from '@shared/constants/constant';
import { ResetPasswordDto } from './dto/reset.password';
import { forgetPasswordSchema } from './joi/forgot.password.schema';
import { resetPasswordSchema } from './joi/reset.password.schema';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { Throttle } from '@nestjs/throttler';
import { CustomThrottlerGuard } from '@shared/helpers/throttler-exception';
import { CurrentToken } from 'src/core/decorators/current-token.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new JoiValidationPipe(loginJoi))
    loginDto: LoginDto,
    @Req() req: Request,
  ) {
    const ip = getIp(req);
    const data = await this.authService.login(loginDto, ip);
    return response.successResponse({
      message: data.message,
      data: data.data,
    });
  }

  @Get('logout')
  @UseGuards(AuthGuard)
  async logout(
    @Req() req: Request,
    @CurrentUser() user: User,
    @CurrentToken() token: string,
  ) {
    const ip = getIp(req);
    const message = await this.authService.logout(user, token, ip);
    return response.successResponse({
      message: message,
      data: {},
    });
  }

  @Post('forgot-password')
  @Throttle({
    default: { limit: 2, ttl: 60000 },
  })
  @UseGuards(CustomThrottlerGuard)
  @HttpCode(200)
  async forgotPassword(
    @Body(new JoiValidationPipe(forgetPasswordSchema))
    forgetPasswordDto: ForgetPasswordDto,
  ) {
    const { email } = forgetPasswordDto;
    await this.authService.forgotPassword(email);
    return response.successResponse({
      message: MESSAGE.PASSWORD_RECOVERY_OTP_SENT,
      data: {},
    });
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(
    @Body(new JoiValidationPipe(resetPasswordSchema))
    resetPasswordDto: ResetPasswordDto,
  ) {
    const { email, otp, password } = resetPasswordDto;
    await this.authService.resetPassword(email, otp, password);
    return response.successResponse({
      message: MESSAGE.PASSWORD_RESET,
      data: {},
    });
  }
}
