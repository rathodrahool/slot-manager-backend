import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import response from '@shared/response';
import { AuthGuard } from 'src/core/guard/auth.guard';
import { JoiValidationPipe } from 'src/core/pipes/joi-validation.pipe';
import { createUserJoi } from './joi/create-user.schema';
import { updateUserSchema } from './joi/update-user.schema';
import { MESSAGE } from '@shared/constants/constant';
import { AccessControlGuard } from 'src/core/guard/access-control.guard';
import {
  Permission,
  Section,
} from 'src/core/decorators/access-control.decorator';
import { FindAllQuery } from '@shared/constants/types';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { changePasswordJoi } from './joi/change-password.schema';
import { ChangePasswordDto } from './dto/change-password.dto';
@UseGuards(AuthGuard, AccessControlGuard)
@Section('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Permission('create')
  async create(
    @Body(new JoiValidationPipe(createUserJoi))
    createUserDto: CreateUserDto,
  ) {
    const message = await this.userService.create(createUserDto);
    return response.successCreate({
      message: message,
      data: {},
    });
  }

  @Get('profile')
  async myProfile(@CurrentUser() user: User) {
    const result = await this.userService.getUserProfile(user.id);
    return response.successResponse({
      message: MESSAGE.RECORD_FOUND('Profile'),
      data: result,
    });
  }

  @Post('change-password')
  async changePassword(
    @Body(new JoiValidationPipe(changePasswordJoi))
    changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.userService.changePassword(
      user.id,
      changePasswordDto,
    );
    return response.successResponse({
      message: MESSAGE.RECORD_UPDATED('Password'),
      data: result,
    });
  }

  @Get()
  @Permission('view')
  async findAll(@Query() query: FindAllQuery) {
    const { limit, offset, search, order } = query;
    const result = await this.userService.findAll(
      limit,
      offset,
      search,
      order,
    );
    return response.successResponseWithPagination(result);
  }

  @Get(':id')
  @Permission('view')
  async findOne(@Param('id') id: string) {
    const result = await this.userService.findOne(id);

    return response.successResponse({
      message: result
        ? MESSAGE.RECORD_FOUND('User')
        : MESSAGE.RECORD_NOT_FOUND('User'),
      data: result ? result : {},
    });
  }

  @Patch(':id')
  @Permission('edit')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateUserSchema)) updateUserDto: UpdateUserDto,
  ) {
    const result = await this.userService.update(id, updateUserDto);
    return response.successResponse({
      message: result.affected
        ? MESSAGE.RECORD_UPDATED('User')
        : MESSAGE.RECORD_NOT_FOUND('User'),
      data: {},
    });
  }

  @Delete(':id')
  @Permission('delete')
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return response.successResponse({
      message: MESSAGE.RECORD_DELETED('User'),
      data: {},
    });
  }
}
