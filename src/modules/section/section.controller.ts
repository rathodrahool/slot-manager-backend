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
import { CreateSectionSchema } from './joi/create.section.schema';
import { UpdateSectionSchema } from './joi/update.section.schema';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import {
  Permission,
  Section,
} from 'src/core/decorators/access-control.decorator';
import { AuthGuard } from 'src/core/guard/auth.guard';
import { AccessControlGuard } from 'src/core/guard/access-control.guard';
import { FindAllQuery } from '@shared/constants/types';

@UseGuards(AuthGuard, AccessControlGuard)
@Section('section')
@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  @Permission('create')
  async create(
    @Body(new JoiValidationPipe(CreateSectionSchema))
    createSectionDto: CreateSectionDto,
  ) {
    await this.sectionService.create(createSectionDto);
    return response.successResponse({
      message: MESSAGE.RECORD_CREATED('Section'),
      data: {},
    });
  }

  @Get()
  @Permission('view')
  async findAll(@Query() query: FindAllQuery) {
    const { limit, offset, search, order } = query;
    const result = await this.sectionService.findAll(
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
    const result = await this.sectionService.findOne(id);
    return response.successResponse({
      message: result
        ? MESSAGE.RECORD_FOUND('Section')
        : MESSAGE.RECORD_NOT_FOUND('Section'),
      data: result ? result : {},
    });
  }

  @Patch(':id')
  @Permission('edit')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(UpdateSectionSchema))
    updateSectionDto: UpdateSectionDto,
  ) {
    const result = await this.sectionService.update(id, updateSectionDto);

    return response.successResponse({
      message: result.affected
        ? MESSAGE.RECORD_UPDATED('Section')
        : MESSAGE.RECORD_NOT_FOUND('Section'),
      data: {},
    });
  }

  @Delete(':id')
  @Permission('delete')
  async remove(@Param('id') id: string) {
    const result = await this.sectionService.remove(id);
    response.successResponse({
      message: result.affected
        ? MESSAGE.RECORD_DELETED('Section')
        : MESSAGE.RECORD_NOT_FOUND('Section'),
      data: {},
    });
  }
}
