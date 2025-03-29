import { User } from '@modules/user/entities/user.entity';
import { DefaultEntity } from '@shared/entities/default.entity';
import { RoleSectionPermission } from '@shared/entities/role.section.permission.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity()
export class Role extends DefaultEntity {
  @Column({ type: 'character varying' })
  name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @OneToMany(
    () => RoleSectionPermission,
    (role_section_permission) => role_section_permission.role,
  )
  role_section_permission: RoleSectionPermission[];
}
