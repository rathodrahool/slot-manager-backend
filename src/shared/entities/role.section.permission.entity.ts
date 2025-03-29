import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Role } from '@modules/role/entities/role.entity';
import { Permission } from '@modules/permission/entities/permission.entity';
import { Section } from '@modules/section/entities/section.entity';
import { DefaultEntity } from './default.entity';

@Entity()
export class RoleSectionPermission extends DefaultEntity {
  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Section, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @Column({
    type: 'boolean',
    default: false,
  })
  has_access: boolean;
}
