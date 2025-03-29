import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MESSAGE } from '@shared/constants/constant';
import { RoleSectionPermission } from '@shared/entities/role.section.permission.entity';
import { Request } from 'express';
import { DataSource } from 'typeorm';

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const user = request['user'];

    // Extract metadata (the required permission for the route)
    const permission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );
    const section = this.reflector.get<string>('section', context.getClass());

    if (!permission || !section) {
      return true; // No permissions required, allow access
    }

    const roleId = user.role.id;

    // Query to check if the user's role has access
    const hasAccess = await this.dataSource
      .getRepository(RoleSectionPermission)
      .createQueryBuilder('rsp')
      .innerJoin('rsp.role', 'role')
      .innerJoin('rsp.section', 'section')
      .innerJoin('rsp.permission', 'permission')
      .where('rsp.role_id = :roleId AND rsp.has_access = true', { roleId })
      .andWhere('section.name = :section', { section })
      .andWhere('permission.name = :permission', { permission })
      .getCount();

    if (hasAccess === 0) {
      throw new ForbiddenException(MESSAGE.ACCESS_DENIED(permission, section));
    }

    return true;
  }
}
