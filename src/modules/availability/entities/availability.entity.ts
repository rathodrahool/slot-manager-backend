import { DefaultEntity } from "@shared/entities/default.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { User } from "@modules/user/entities/user.entity";
import { SlotStatus } from '@shared/constants/enum';

@Entity('availabilities')
export class Availability extends DefaultEntity {
    @Column({ type: 'timestamp', nullable: false })
    date: Date;

    @Column({ type: 'timestamp', nullable: false })
    start_time: Date;

    @Column({ type: 'timestamp', nullable: false })
    end_time: Date;

    @ManyToOne(() => User, (user) => user.availabilities, {
        nullable: false,
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    user_id: number;

    @Column({
        type: 'enum',
        enum: SlotStatus,
        default: SlotStatus.AVAILABLE
    })
    status: SlotStatus;
}
