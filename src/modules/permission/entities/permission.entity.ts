import { DefaultEntity } from '@shared/entities/default.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Permission extends DefaultEntity {
  @Column({ type: 'character varying' })
  name: string;

  @Column({ type: 'integer', nullable: true })
  index: number;
}
