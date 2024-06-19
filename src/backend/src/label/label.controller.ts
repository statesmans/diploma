import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { LabelEntity } from './label.entity';
import { LabelService } from './label.service';
import { CreateLabelDto, UpdateLabelDto } from './dto/label.dto';

@Controller('label')
export class LabelController {

    constructor (
        private labelService: LabelService,
    ) {}

    @Get('/manual/image-id/:imageId')
    async getManualByImageId(
      @Param('imageId') imageId: number,
    ): Promise<LabelEntity> {
      return await this.labelService.getManualLabelByImageId(imageId);
    }

    @Get('/automatic/image-id/:imageId')
    async getAutomaticByImageId(
      @Param('imageId') imageId: number,
    ): Promise<LabelEntity[]> {
      return await this.labelService.getInferredLabelsByImageId(imageId);
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
