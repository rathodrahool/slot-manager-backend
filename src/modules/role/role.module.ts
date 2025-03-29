import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role } from './entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleSectionPermission } from '@shared/entities/role.section.permission.entity';
import { Permission } from '@modules/permission/entities/permission.entity';
import { Section } from '@modules/section/entities/section.entity';
import { Token } from '@modules/token/entities/token.entity';
import { User } from '@modules/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      RoleSectionPermission,
      Permission,
      Section,
      Token,
      User,
    ]),
  ],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
