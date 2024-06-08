import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ModelsService } from './models.service';
import { ModelEntity } from './models.entity';
import { ModelCreateDto, ModelCreateSchemaDto, ModelUpdateDto, ModelUpdateSchemaDto } from './dto/model.dto';
import { JoiPipe } from 'nestjs-joi';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  async getAllModels(): Promise<ModelEntity[]> {
    return await this.modelsService.getAll();
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string
  ): Promise<ModelEntity> {
    return await this.modelsService.getOne(id);
  }

  @Post()
  async createModel(
    @Body(new JoiPipe(ModelCreateSchemaDto))
    dto: ModelCreateDto,
  ): Promise<ModelEntity> {
    return await this.modelsService.create(dto);
  }

  @Post(':modelId/train')
  async startTraining(
    @Param('modelId') modelId: string
  ): Promise<void> {
    await this.modelsService.startTraining(modelId);
  }

  @Put(':id')
  async updateModel(
    @Param('id') id: string,
    @Body(new JoiPipe(ModelUpdateSchemaDto))
    dto: ModelUpdateDto,
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
