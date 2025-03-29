import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { User } from '@modules/user/entities/user.entity';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import response from '@shared/response';
import { MESSAGE } from '@shared/constants/constant';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
 async create(@Body() createAvailabilityDto: CreateAvailabilityDto,@CurrentUser() user: User,) {
    await this.availabilityService.create(createAvailabilityDto,user);
    return response.successResponse({
      message: MESSAGE.RECORD_CREATED('Availability '),
      data: {},
    });
  }

  @Get('slots')
  async getAvailableSlots(@Query('date') date: string) {
    const result = await this.availabilityService.getAvailableSlots(date);
    return response.successResponse({
      message: MESSAGE.RECORD_FOUND('Slots'),
      data:result,
    });
  }
}
