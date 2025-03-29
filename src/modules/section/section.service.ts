import { BadRequestException, Injectable } from '@nestjs/common';
import { FindOneOptions, ILike, IsNull, Repository } from 'typeorm';
import { MESSAGE } from '@shared/constants/constant';
import { plainToInstance } from 'class-transformer';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}
  async create(createSectionDto: CreateSectionDto) {
    const isExists = await this.sectionRepository.findOne({
      where: {
        name: createSectionDto.name,
      },
    });
    if (isExists) {
      throw new BadRequestException(MESSAGE.ALREADY_EXISTS('Section'));
    }
    await this.sectionRepository.save(createSectionDto);
  }

  async findAll(
    limit: number,
    offset: number,
    search: string,
    order: { [key: string]: 'ASC' | 'DESC' },
  ) {
    const [list, count] = await this.sectionRepository.findAndCount({
      where: {
        name: search ? ILike(`%${search}%`) : undefined,
      },
      take: limit,
      skip: offset,
      order: order,
    });

    const result = {
      message: MESSAGE.RECORD_FOUND('Section'),
      total: count,
      limit: +limit,
      offset: +offset,
      data: plainToInstance(Section, list),
    };
    return result;
  }

  async findOne(id: string) {
    const result = await this.sectionRepository.findOne({
      where: { id: id },
    });
    return plainToInstance(Section, result);
  }

  async findOneWhere(where: FindOneOptions<Section>): Promise<Section> {
    const record = await this.sectionRepository.findOne(where);
    return record;
  }

  async update(id: string, updateSectionDto: UpdateSectionDto) {
    const isExists = await this.sectionRepository.findOne({
      where: { name: updateSectionDto.name },
    });
    if (isExists) {
      throw new BadRequestException(MESSAGE.ALREADY_EXISTS('Section'));
    }
    const result = await this.sectionRepository.update(id, updateSectionDto);
    return result;
  }

  async remove(id: string) {
    const data = await this.sectionRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!data) {
      throw new BadRequestException(MESSAGE.RECORD_NOT_FOUND('Section'));
    }
    const result = await this.sectionRepository.update(
      {
        id: id,
        deleted_at: IsNull(),
      },
      {
        deleted_at: new Date().toISOString(),
        name: `${data.name}-${String(new Date().getTime())}`,
      },
    );
    return result;
  }
}
