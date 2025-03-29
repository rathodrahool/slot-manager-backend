import { Token } from '@modules/token/entities/token.entity';
import { DefaultStatus } from '@shared/constants/enum';
import { DefaultEntity } from '@shared/entities/default.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Otp } from '@modules/auth/otp/entities/otp.entity';
import { Role } from '@modules/role/entities/role.entity';
import { Availability } from '@modules/availability/entities/availability.entity';

@Entity()
export class User extends DefaultEntity {
  @Column({
    type: 'enum',
    enum: DefaultStatus,
    default: DefaultStatus.ACTIVE,
  })
  status: DefaultStatus;

  @Column({
    type: 'character varying',
  })
  name: string;

  @Column({
    type: 'character varying',
    unique: true,
  })
  email: string;

  @Column({
    type: 'character varying',
  })
  password: string;

  @OneToMany(() => Token, (token) => token.user)
  token: Token[];

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Otp, (otp) => otp.user)
  otp: Otp[];

  @OneToMany(() => Availability, (availability) => availability.user)
  availabilities: Availability[];
}
