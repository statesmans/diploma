import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ImageSetService } from './image-set.service';
import { ImageSetEntity } from './image-set.entity';
import { ImageSetDto } from './dto/imageSetCreate.dto';

@Controller('image-sets')
export class ImageSetController {
  constructor(private readonly imageSetService: ImageSetService) {}

  @Get()
  async getAll(): Promise<ImageSetEntity[]> {
    return await this.imageSetService.getAll();
  }

  @Post()
  async create(
    @Body() dto: ImageSetDto, 
  ): Promise<ImageSetEntity[]> {
    return await this.imageSetService.create(dto);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
  ): Promise<ImageSetEntity> {
    return await this.imageSetService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: ImageSetDto, 
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
