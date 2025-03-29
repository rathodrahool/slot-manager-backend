import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { FindOneOptions, IsNull, Repository } from 'typeorm';
import { OtpPayload } from '@shared/constants/types';
import { plainToInstance } from 'class-transformer';
import { UpdateOtpDto } from '../dto/update.otp.dto';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  generateOtp = () => {
    let otp = Math.floor(100000 + Math.random() * 100000);
    if (['localhost'].includes(process.env.NODE_ENV)) {
      otp = 123456;
    }
    return otp;
  };

  async save(payload: OtpPayload) {
    await this.otpRepository.save(payload);
  }

  async findOneWhere(where: FindOneOptions<Otp>) {
    const result = await this.otpRepository.findOne(where);
    return plainToInstance(Otp, result);
  }
  async update(id: string, obj: UpdateOtpDto) {
    await this.otpRepository.update(id, obj);
  }

  async remove(id: string) {
    await this.otpRepository.update(
      {
        id: id,
        deleted_at: IsNull(),
      },
      {
        deleted_at: new Date().toISOString(),
      },
    );
  }
}
