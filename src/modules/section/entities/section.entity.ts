import { DefaultEntity } from '@shared/entities/default.entity';
import { RoleSectionPermission } from '@shared/entities/role.section.permission.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity()
export class Section extends DefaultEntity {
  @Column({ type: 'character varying' })
  name: string;

  @OneToMany(
    () => RoleSectionPermission,
    (role_section_permission) => role_section_permission.section,
  )
  role_section_permission: RoleSectionPermission[];

  @Column({ type: 'character varying', nullable: true })
  label: string;

  @Column({ type: 'integer', nullable: true })
  index: number;
}
