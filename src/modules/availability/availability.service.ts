import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Availability } from './entities/availability.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { User } from '@modules/user/entities/user.entity';
import { AvailableSlotsResponseDto, TimeSlot } from './dto/slot-response.dto';
import { AVAILABILITY_MESSAGES } from '@shared/constants/constant';
import { SlotStatus } from '@shared/constants/enum';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
  ){}

  async create(createAvailabilityDto: CreateAvailabilityDto, user: User) {
      const currentDate = new Date();
      const startTime = new Date(createAvailabilityDto.start_time);
      const endTime = new Date(createAvailabilityDto.end_time);
      
      // // Validate date format
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new BadRequestException('Invalid date format provided');
      }

      // Updated: Validate business hours (9 AM to 7:15 PM)
      if (startTime.getHours() < 9 || 
          (endTime.getHours() > 19 || (endTime.getHours() === 19 && endTime.getMinutes() > 15))) {
        throw new BadRequestException('Business hours are from 9 AM to 7:15 PM');
      }

      // Validate 30-minute slots
      if (startTime.getMinutes() % 30 !== 0 || endTime.getMinutes() % 30 !== 0) {
        throw new BadRequestException(AVAILABILITY_MESSAGES.INVALID_TIME_SLOT);
      }

      // Minimum duration validation (30 minutes)
      const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      if (durationInMinutes < 30) {
        throw new BadRequestException(AVAILABILITY_MESSAGES.MINIMUM_DURATION);
      }

      // Calculate date 7 days from now
      const maxAllowedDate = new Date();
      maxAllowedDate.setDate(currentDate.getDate() + 7);

      if (startTime > maxAllowedDate || endTime > maxAllowedDate) {
        throw new BadRequestException(AVAILABILITY_MESSAGES.FUTURE_DATE_LIMIT);
      }

      if (startTime < currentDate || endTime < currentDate) {
        throw new BadRequestException(AVAILABILITY_MESSAGES.PAST_DATE);
      }

      if (endTime <= startTime) {
        throw new BadRequestException(AVAILABILITY_MESSAGES.INVALID_TIME_RANGE);
      }

      const overlappingAvailability = await this.availabilityRepository
        .createQueryBuilder('availability')
        .where('availability.user_id = :userId', { 
          userId: user.id 
        })
        .andWhere('(availability.start_time, availability.end_time) OVERLAPS (:startTime, :endTime)', {
          startTime: createAvailabilityDto.start_time,
          endTime: createAvailabilityDto.end_time,
        })
        .getOne();

      if (overlappingAvailability) {
        throw new BadRequestException(AVAILABILITY_MESSAGES.OVERLAPPING_SLOT);
      }

      const availability = this.availabilityRepository.create({
        ...createAvailabilityDto,
        user:{id:user.id}
      });
      const result = await this.availabilityRepository.save(availability);
      return plainToInstance(Availability, result);
  }

  async getAvailableSlots(date: string): Promise<AvailableSlotsResponseDto> {

      const targetDate = new Date(date);
      const currentDate = new Date();

      // Validate date format
      if (isNaN(targetDate.getTime())) {
        throw new BadRequestException(AVAILABILITY_MESSAGES.INVALID_DATE_FORMAT);
      }

      // Reset time parts for date comparison
      currentDate.setHours(0, 0, 0, 0);
      targetDate.setHours(0, 0, 0, 0);

      // Validate date
      if (targetDate < currentDate) {
        throw new BadRequestException(AVAILABILITY_MESSAGES.PAST_SLOTS);
      }

      const maxAllowedDate = new Date();
      maxAllowedDate.setDate(currentDate.getDate() + 7);
      maxAllowedDate.setHours(0, 0, 0, 0);

      if (targetDate > maxAllowedDate) {
        throw new BadRequestException(AVAILABILITY_MESSAGES.FUTURE_SLOTS_LIMIT);
      }

      const existingAvailabilities = await this.availabilityRepository
        .createQueryBuilder('availability')
        .where('DATE(availability.date) = DATE(:date)', { date })
        .orderBy('availability.start_time', 'ASC')
        .getMany();

      const bookedSlots = await this.availabilityRepository
        .createQueryBuilder('availability')
        .where('DATE(availability.date) = DATE(:date)', { date })
        .andWhere('availability.status = :status', { status: SlotStatus.BOOKED })
        .getMany();

      // Generate all possible 30-minute slots between 9 AM and 7:15 PM
      const allSlots: TimeSlot[] = [];
      const startHour = 9;
      const endHour = 19;

      for (let hour = startHour; hour <= endHour; hour++) {
        const maxMinutes = hour === 19 ? 15 : 60;
        for (let minute = 0; minute < maxMinutes; minute += 30) {
          // Skip the last incomplete slot
          if (hour === 19 && minute + 30 > 15) continue;

          const slotStart = new Date(targetDate);
          const slotEnd = new Date(targetDate);
          
          slotStart.setHours(hour, minute, 0, 0);
          slotEnd.setHours(hour, minute + 30, 0, 0);

          // Skip slots that are in the past for current date
          if (targetDate.getDate() === currentDate.getDate() && slotStart < new Date()) {
            continue;
          }

          // Format times for response
          const startTime = this.formatTime(slotStart);
          const endTime = this.formatTime(slotEnd);

          // Check if slot is available and not adjacent to booked slots
          const isSlotAvailable = !this.isSlotBookedOrAdjacent(slotStart, slotEnd, bookedSlots);

          if (isSlotAvailable) {
            allSlots.push({ startTime, endTime });
          }
        }
      }

      return {
        date,
        availableSlots: allSlots
      };
  }

  private isSlotBookedOrAdjacent(slotStart: Date, slotEnd: Date, bookedSlots: Availability[]): boolean {
    for (const bookedSlot of bookedSlots) {
      const bookedStart = new Date(bookedSlot.start_time);
      const bookedEnd = new Date(bookedSlot.end_time);
      
      // Check if slot is booked or adjacent (30 minutes before or after)
      const adjacentStart = new Date(bookedStart);
      adjacentStart.setMinutes(adjacentStart.getMinutes() - 30);
      const adjacentEnd = new Date(bookedEnd);
      adjacentEnd.setMinutes(adjacentEnd.getMinutes() + 30);

      if ((slotStart >= adjacentStart && slotStart < adjacentEnd) ||
          (slotEnd > adjacentStart && slotEnd <= adjacentEnd)) {
        return true;
      }
    }
    return false;
  }

  private formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
}
