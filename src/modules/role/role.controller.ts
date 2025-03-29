import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JoiValidationPipe } from 'src/core/pipes/joi-validation.pipe';

import response from '@shared/response';
import { MESSAGE } from '@shared/constants/constant';
import { UpdateRoleSchema } from './joi/update.role.schema';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleSchema } from './joi/create.role.schema';
import { AuthGuard } from 'src/core/guard/auth.guard';
import { AccessControlGuard } from 'src/core/guard/access-control.guard';
import {
  Permission,
  Section,
} from 'src/core/decorators/access-control.decorator';
import { FindAllQuery } from '@shared/constants/types';
@UseGuards(AuthGuard, AccessControlGuard)
@Section('role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Permission('create')
  async create(
    @Body(new JoiValidationPipe(CreateRoleSchema))
    createRoleDto: CreateRoleDto,
  ) {
    await this.roleService.create(createRoleDto);
    return response.successResponse({
      message: MESSAGE.RECORD_CREATED('Role'),
      data: {},
    });
  }

  @Get()
  @Permission('view')
  async findAll(@Query() query: FindAllQuery) {
    const { limit, offset, search, order } = query;
    const result = await this.roleService.findAll(limit, offset, search, order);
    return response.successResponseWithPagination(result);
  }

  @Get('permission')
  @Permission('view')
  async getUserPermission() {
    const result = await this.roleService.getUserPermission();
    return response.successResponse({
      message: result
        ? MESSAGE.RECORD_FOUND('Permission')
        : MESSAGE.RECORD_NOT_FOUND('Permission'),
      data: result,
    });
  }

  @Get(':id')
  @Permission('view')
  async findOne(@Param('id') id: string) {
    const result = await this.roleService.findOne(id);
    if (result) {
      const section = await this.roleService.getRoleSectionPermissionByRoleId(
        result.id,
      );
      Object.assign(result, { section });
    }
    return response.successResponse({
      message: result
        ? MESSAGE.RECORD_FOUND('Role')
        : MESSAGE.RECORD_NOT_FOUND('Role'),
      data: result ? result : {},
    });
  }
  @Patch(':id')
  @Permission('edit')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(UpdateRoleSchema))
    updateRoleDto: UpdateRoleDto,
  ) {
    const result = await this.roleService.update(id, updateRoleDto);

    return response.successResponse({
      message: result.affected
        ? MESSAGE.RECORD_UPDATED('Role')
        : MESSAGE.RECORD_NOT_FOUND('Role'),
      data: {},
    });
  }

  @Delete(':id')
  @Permission('delete')
  async remove(@Param('id') id: string) {
    const result = await this.roleService.remove(id);
    return response.successResponse({
      message: result.affected
        ? MESSAGE.RECORD_DELETED('Role')
        : MESSAGE.RECORD_NOT_FOUND('Role'),
      data: {},
    });
  }
}
