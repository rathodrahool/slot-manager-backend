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
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JoiValidationPipe } from 'src/core/pipes/joi-validation.pipe';
import { CreatePermissionSchema } from './joi/create.permission.schema';
import response from '@shared/response';
import { MESSAGE } from '@shared/constants/constant';
import { UpdatePermissionSchema } from './joi/update.permission.schema';
import { AuthGuard } from 'src/core/guard/auth.guard';
import { AccessControlGuard } from 'src/core/guard/access-control.guard';
import {
  Permission,
  Section,
} from 'src/core/decorators/access-control.decorator';
import { FindAllQuery } from '@shared/constants/types';

@UseGuards(AuthGuard, AccessControlGuard)
@Section('permission')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @Permission('create')
  async create(
    @Body(new JoiValidationPipe(CreatePermissionSchema))
    createPermissionDto: CreatePermissionDto,
  ) {
    await this.permissionService.create(createPermissionDto);
    return response.successResponse({
      message: MESSAGE.RECORD_CREATED('Permission'),
      data: {},
    });
  }

  @Get()
  @Permission('view')
  async findAll(@Query() query: FindAllQuery) {
    const result = await this.permissionService.findAll(
      query.limit,
      query.offset,
      query.search,
      query.order,
    );
    return response.successResponseWithPagination(result);
  }

  @Get(':id')
  @Permission('view')
  async findOne(@Param('id') id: string) {
    const result = await this.permissionService.findOne(id);
    return response.successResponse({
      message: result
        ? MESSAGE.RECORD_FOUND('Permission')
        : MESSAGE.RECORD_NOT_FOUND('Permission'),
      data: result ? result : {},
    });
  }
  @Patch(':id')
  @Permission('edit')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(UpdatePermissionSchema))
    updatePermissionDto: UpdatePermissionDto,
  ) {
    const result = await this.permissionService.update(id, updatePermissionDto);

    return response.successResponse({
      message: result.affected
        ? MESSAGE.RECORD_UPDATED('Permission')
        : MESSAGE.RECORD_NOT_FOUND('Permission'),
      data: {},
    });
  }

  @Delete(':id')
  @Permission('delete')
  async remove(@Param('id') id: string) {
    const result = await this.permissionService.remove(id);
    response.successResponse({
      message: result.affected
        ? MESSAGE.RECORD_DELETED('Permission')
        : MESSAGE.RECORD_NOT_FOUND('Permission'),
      data: {},
    });
  }
}
