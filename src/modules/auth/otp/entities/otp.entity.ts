import { User } from '@modules/user/entities/user.entity';
import { OtpType } from '@shared/constants/enum';

import { DefaultEntity } from '@shared/entities/default.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Otp extends DefaultEntity {
  @Column({ type: 'integer' })
  otp: number;

  @Column({ type: 'enum', enum: OtpType })
  type: OtpType;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'timestamp with time zone' })
  expire_at: Date;

  @ManyToOne(() => User, (user) => user.otp, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
