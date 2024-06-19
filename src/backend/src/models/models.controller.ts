import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ModelsService } from './models.service';
import { ModelEntity } from './models.entity';
import { ModelCreateDto, ModelUpdateDto } from './dto/model.dto';
import { ModelQueryDto } from './dto/model-query.dto';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  async getAllModels(
    @Query() query: ModelQueryDto
  ): Promise<ModelEntity[]> {
    return await this.modelsService.getAll(query);
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string
  ): Promise<ModelEntity> {
    return await this.modelsService.getOne(id);
  }

  @Post()
  async createModel(
    @Body() dto: ModelCreateDto,
  ): Promise<ModelEntity> {
    return await this.modelsService.create(dto);
  }

  @Post(':modelId/predict-image-set/:imageSetId')
  async startImageSetInference(
    @Param('modelId') modelId: string,
    @Param('imageSetId') imageSetId: number
  ): Promise<void> {
    await this.modelsService.predictImageSet(modelId, imageSetId);
  }

  @Post(':modelId/predict-image/:imageId')
  async startImageInference(
    @Param('modelId') modelId: string,
    @Param('imageId') imageId: number
  ): Promise<void> {
    await this.modelsService.predictImage(modelId, imageId);
  }

  @Post(':modelId/train')
  async startTraining(
    @Param('modelId') modelId: string
  ): Promise<void> {
    await this.modelsService.startTraining(modelId);
  }

  @Patch(':id')
  async updateModel(
    @Param('id') id: string,
    @Body() dto: ModelUpdateDto,
  ): Promise<ModelEntity> {
    return await this.modelsService.update(id, dto);
  }

  @Delete(':id')
  async deleteModelById(
    @Param('id') id: string
  ): Promise<void> {
    await this.modelsService.delete(id);
  }
}
