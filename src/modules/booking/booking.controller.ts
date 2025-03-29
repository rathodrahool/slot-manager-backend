import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { BookingService } from './booking.service';
import { User } from '@modules/user/entities/user.entity';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async createBooking(
    @Body() bookingData: { date: string; startTime: string },@CurrentUser() user: User
  ) {
    return await this.bookingService.bookSlot(
      bookingData.date,
      bookingData.startTime,
      user
    );
  }
}
