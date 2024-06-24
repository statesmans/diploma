import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ImageSetService } from './image-set.service';
import { ImageSetEntity } from './image-set.entity';
import { ImageSetCreateDto, ImageSetUpdateDto } from './dto/imageSetCreate.dto';
import { ImageSetQueryDto } from './dto/image-set-query.dto';

@Controller('image-sets')
export class ImageSetController {
  constructor(private readonly imageSetService: ImageSetService) {}

  @Get()
  async getAll(
    @Query() query: ImageSetQueryDto
  ): Promise<ImageSetEntity[]> {
    return await this.imageSetService.getAll(query);
  }

  @Post()
  async create(
    @Body() dto: ImageSetCreateDto, 
  ): Promise<ImageSetEntity> {
    return await this.imageSetService.create(dto);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
  ): Promise<ImageSetEntity> {
    return await this.imageSetService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: ImageSetUpdateDto, 
  ): Promise<ImageSetEntity> {
    return await this.imageSetService.update(id, dto);
  }


  @Delete(':id')
  async delete(
    @Param('id') id: number,
  ): Promise<void> {
    await this.imageSetService.delete(id);
  }
}
