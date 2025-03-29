import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { FindOneOptions, ILike, IsNull, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { MESSAGE } from '@shared/constants/constant';
import { plainToClass, plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}
  async create(createPermissionDto: CreatePermissionDto) {
    const isExists = await this.permissionRepository.findOne({
      where: {
        name: createPermissionDto.name,
      },
    });
    if (isExists) {
      throw new BadRequestException(MESSAGE.ALREADY_EXISTS('Permission'));
    }
    await this.permissionRepository.save(createPermissionDto);
  }

  async findAll(
    limit: number,
    offset: number,
    search: string,
    order: { [key: string]: 'ASC' | 'DESC' },
  ) {
    const [list, count] = await this.permissionRepository.findAndCount({
      where: {
        name: search ? ILike(`%${search}%`) : undefined,
      },
      take: limit,
      skip: offset,
      order: order,
    });

    const result = {
      message: MESSAGE.RECORD_FOUND('Permission'),
      total: count,
      limit: +limit,
      offset: +offset,
      data: plainToInstance(Permission, list),
    };
    return result;
  }

  async findOne(id: string) {
    const result = await this.permissionRepository.findOne({
      where: { id: id },
    });
    return plainToInstance(Permission, result);
  }

  async findOneWhere(where: FindOneOptions<Permission>): Promise<Permission> {
    const record = await this.permissionRepository.findOne(where);
    return plainToClass(Permission, record);
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const isExists = await this.permissionRepository.findOne({
      where: { name: updatePermissionDto.name },
    });
    if (isExists) {
      throw new BadRequestException(MESSAGE.ALREADY_EXISTS('Permission'));
    }
    const result = await this.permissionRepository.update(
      id,
      updatePermissionDto,
    );
    return result;
  }

  async remove(id: string) {
    const data = await this.permissionRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!data) {
      throw new BadRequestException(MESSAGE.RECORD_NOT_FOUND('Permission'));
    }
    const result = await this.permissionRepository.update(
      {
        id: id,
        deleted_at: IsNull(),
      },
      {
        deleted_at: new Date().toISOString(),
        name: `${data.name}-${String(new Date().getTime())}`,
      },
    );
    return result;
  }
}
