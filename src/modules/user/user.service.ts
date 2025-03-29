import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Not, Repository } from 'typeorm';
import { ERROR, MESSAGE } from '@shared/constants/constant';
import hashPassword from '@shared/function/hash-password';
import { plainToInstance } from 'class-transformer';
import comparePassword from '@shared/function/compare-password';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (user) {
      throw new ConflictException(ERROR.ALREADY_EXISTS('User'));
    }

    const hashedPassword = await hashPassword(createUserDto.password);

    const userObject = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      role: { id: createUserDto.role },
    });

    await this.userRepository.save(userObject);

    return MESSAGE.RECORD_CREATED('User');
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    const isCorrectPassword = await comparePassword(
      changePasswordDto.current_password,
      user.password,
    );

    if (!isCorrectPassword) {
      throw new BadRequestException(MESSAGE.WRONG_CREDENTIALS);
    }

    const hashedPassword = await hashPassword(changePasswordDto.new_password);
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });
  }
  async findAll(
    limit: number,
    offset: number,
    search: string,
    order: { [key: string]: 'ASC' | 'DESC' },
  ) {
    const [list, count] = await this.userRepository.findAndCount({
      where: {
        name: search ? ILike(`%${search}%`) : undefined,
      },
      relations: {  role: true },
      select: [
        'id',
        'name',
        'email',
        'status',
        'created_at',
      ],
      order: order,
      take: limit,
      skip: offset,
    });
    const result = {
      message: MESSAGE.RECORD_FOUND('User'),
      total: count,
      limit: +limit,
      offset: +offset,
      data: plainToInstance(User, list),
    };
    return result;
  }

  async findOne(id: string) {
    const result = await this.userRepository.findOne({
      where: { id: id },
      relations: {  role: true },
      select: [
        'id',
        'name',
        'email',
        'status',
        'created_at',
      ],
    });
    return plainToInstance(User, result);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const isExists = await this.userRepository.findOne({
      where: {
        id: Not(id),
        email: ILike(updateUserDto.email),
      },
    });
    if (isExists) {
      throw new BadRequestException(MESSAGE.ALREADY_EXISTS('Email'));
    }
    const {  role, ...data } = updateUserDto;
    const result = await this.userRepository.update(id, {
      ...data,
      role: { id: role },
    });
    return result;
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        token: true,
        otp: true,
      },
    });
    if (!user) {
      throw new BadRequestException(MESSAGE.RECORD_NOT_FOUND('User'));
    }
    const result = await this.userRepository.softRemove(user, {
      data: { email: `${user.email}-${String(new Date().getTime())}` },
    });
    return result;
  }
}
