import { DefaultEntity } from "@shared/entities/default.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { User } from "@modules/user/entities/user.entity";
import { Availability } from "@modules/availability/entities/availability.entity";

@Entity('bookings')
export class Booking extends DefaultEntity {
    @ManyToOne(() => Availability, { nullable: false })
    @JoinColumn({ name: 'availability_id' })
    availability: Availability;

    @Column()
    availability_id: number;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    user_id: number;

    @Column({ type: 'timestamp', nullable: false })
    booking_date: Date;
}
