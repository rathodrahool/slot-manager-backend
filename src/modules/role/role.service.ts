import { BadRequestException, Injectable } from '@nestjs/common';
import { ILike, IsNull, Not, Repository } from 'typeorm';
import { MESSAGE } from '@shared/constants/constant';
import { plainToInstance } from 'class-transformer';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleSectionPermission } from '@shared/entities/role.section.permission.entity';
import { AllSectionPermission } from '@shared/constants/types';
import { Section } from '@modules/section/entities/section.entity';
import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(RoleSectionPermission)
    private readonly roleSectionPermissionRepository: Repository<RoleSectionPermission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    const isExists = await this.roleRepository.findOne({
      where: {
        name: createRoleDto.name,
      },
    });
    if (isExists) {
      throw new BadRequestException(MESSAGE.ALREADY_EXISTS('Role'));
    }
    const role = await this.roleRepository.save({
      name: createRoleDto.name,
    });
    const roleSectionPermission = [];
    createRoleDto.section.forEach((sectionData) => {
      sectionData.permission.forEach((permissionData) => {
        roleSectionPermission.push({
          role: { id: role.id },
          section: { id: sectionData.id },
          permission: { id: permissionData.id },
          has_access: permissionData.has_access,
        });
      });
    });
    await this.roleSectionPermissionRepository.save(roleSectionPermission);
  }

  async findAll(
    limit: number,
    offset: number,
    search: string,
    order: { [key: string]: 'ASC' | 'DESC' },
  ) {
    const [list, count] = await this.roleRepository.findAndCount({
      where: {
        name: search ? ILike(`%${search}%`) : undefined,
      },
      take: limit,
      skip: offset,
      order: order,
    });

    const result = {
      message: MESSAGE.RECORD_FOUND('Role'),
      total: count,
      limit: +limit,
      offset: +offset,
      data: plainToInstance(Role, list),
    };
    return result;
  }

  async findOne(id: string) {
    const result = await this.roleRepository.findOne({
      where: { id: id },
    });
    return plainToInstance(Role, result);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const isExists = await this.roleRepository.findOne({
      where: { name: updateRoleDto.name, id: Not(id) },
    });
    if (isExists) {
      throw new BadRequestException(MESSAGE.ALREADY_EXISTS('Role'));
    }
    const result = await this.roleRepository.update(id, {
      name: updateRoleDto.name,
    });

    if (result.affected) {
      await this.roleSectionPermissionRepository.save(
        updateRoleDto.role_section_permission,
      );
    }

    return result;
  }

  async remove(id: string) {
    const count = await this.userRepository.count({
      where: { role: { id: id } },
    });
    if (count) {
      throw new BadRequestException('Role in use');
    }
    const data = await this.roleRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!data) {
      throw new BadRequestException(MESSAGE.RECORD_NOT_FOUND('Role'));
    }
    if (data.name.toLowerCase() == 'admin') {
      throw new BadRequestException(MESSAGE.METHOD_NOT_ALLOWED);
    }
    const result = await this.roleRepository.update(
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

  async getRoleSectionPermissionByRoleId(id: string) {
    const result = await this.roleSectionPermissionRepository
      .createQueryBuilder('rsp')
      .select([
        's.id AS id',
        's.name AS name',
        's.label AS label',
        `JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', rsp.id,
              'name', p.name,
              'has_access', rsp.has_access
            )
         ) AS permission`,
      ])
      .innerJoin('section', 's', 's.id = rsp.section_id ')
      .innerJoin('permission', 'p', 'p.id = rsp.permission_id ')
      .where('rsp.role_id = :id', { id })
      .groupBy('s.id, s.name')
      .getRawMany();
    return result;
  }

  async getUserPermission(): Promise<AllSectionPermission[]> {
    const result = await this.sectionRepository
      .createQueryBuilder('s')
      .select([
        's.id AS id',
        's.name AS name',
        's.label AS label',
        `JSON_AGG(
             json_build_object(
                 'id', p.id,
                 'name', p.name
             ) ORDER BY p.index ASC
         ) AS permission`,
      ])
      .leftJoin(
        'permission',
        'p',
        `
          (s.name = 'user' AND p.name IN ('create', 'edit', 'view', 'delete')) OR
          (s.name = 'booking' AND p.name IN ('create', 'edit', 'view', 'delete')) OR
          (s.name = 'availability' AND p.name IN ('create', 'edit', 'view', 'delete')) OR
          (s.name = 'role' AND p.name IN ('create', 'edit', 'view', 'delete')) OR
          (s.name = 'section' AND p.name IN ('create', 'edit', 'view', 'delete')))`,
      )
      .groupBy('s.id, s.name')
      .orderBy('s.index', 'ASC')
      .getRawMany();
    return result;
  }
}
