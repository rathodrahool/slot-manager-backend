import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Availability } from '@modules/availability/entities/availability.entity';
import { User } from '@modules/user/entities/user.entity';
import { BOOKING_MESSAGES } from '@shared/constants/constant';
import { SlotStatus } from '@shared/constants/enum';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
  ) {}

  async bookSlot(date: string, startTime: string, user:User) {
    const targetDate = new Date(date);
    const targetStartTime = new Date(`${date} ${startTime}`);

    if (isNaN(targetDate.getTime()) || isNaN(targetStartTime.getTime())) {
      throw new BadRequestException(BOOKING_MESSAGES.INVALID_DATE_FORMAT);
    }

    const availability = await this.availabilityRepository
      .createQueryBuilder('availability')
      .where('DATE(availability.start_time) = DATE(:date)', { date })
      .andWhere('availability.start_time = :startTime', { startTime: targetStartTime })
      .andWhere('availability.status = :status', { status: SlotStatus.AVAILABLE })
      .getOne();

    if (!availability) {
      throw new BadRequestException(BOOKING_MESSAGES.SLOT_NOT_AVAILABLE);
    }

    // Check for adjacent bookings
    const adjacentBookings = await this.availabilityRepository
      .createQueryBuilder('availability')
      .where('DATE(availability.start_time) = DATE(:date)', { date })
      .andWhere('availability.status = :status', { status: SlotStatus.BOOKED })
      .andWhere(
        '(availability.start_time BETWEEN :beforeTime AND :afterTime)',
        { 
          beforeTime: new Date(targetStartTime.getTime() - 30 * 60000),
          afterTime: new Date(targetStartTime.getTime() + 30 * 60000)
        }
      )
      .getOne();

    if (adjacentBookings) {
      throw new BadRequestException(BOOKING_MESSAGES.ADJACENT_BOOKING);
    }

    // Create booking record
    const booking = this.bookingRepository.create({
      availability: { id: availability.id },
      user: { id: user.id },
      booking_date: new Date()
    });

    // Update availability status
    availability.status = SlotStatus.BOOKED;
    await this.availabilityRepository.save(availability);

    return await this.bookingRepository.save(booking);
  }
}
