import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { LabelEntity } from './label.entity';
import { LabelService } from './label.service';
import { CreateLabelDto, UpdateLabelDto } from './dto/label.dto';

@Controller('label')
export class LabelController {

    constructor (
        private labelService: LabelService,
    ) {}

    @Get('/image-id/:imageId')
    async getOneByImageId(
      @Param('imageId') imageId: number,
    ): Promise<LabelEntity> {
        console.log( await this.labelService.findImageId(imageId))
      return await this.labelService.findImageId(imageId);
    }
  
    @Post()
    async create(
      @Body() dto: CreateLabelDto, 
    ): Promise<LabelEntity> {
      return await this.labelService.create(dto);
    }
  
    @Patch(':id')
    async update(
      @Param('id') id: number,
      @Body() dto: UpdateLabelDto, 
    ): Promise<LabelEntity> {
      return await this.labelService.update(id, dto);
    }
  
  
    @Delete(':id')
    async delete(
      @Param('id') id: number,
    ): Promise<void> {
      await this.labelService.delete(id);
    }
}
