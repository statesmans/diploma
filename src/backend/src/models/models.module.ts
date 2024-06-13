import { Module } from '@nestjs/common';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from './models.entity';
import { ImageModule } from 'src/image/image.module';
import { LabelModule } from 'src/label/label.module';
import { AzureService } from 'src/azure/azure.service';
import { TrainingModelService } from './training-model/training-model.service';
import { DefectClassModule } from 'src/defect-class/defect-class.module';

@Module({
  imports: [ 
    TypeOrmModule.forFeature([ModelEntity]),
    ImageModule,
    LabelModule,
    DefectClassModule,
  ],
  controllers: [ModelsController],
  providers: [ModelsService, AzureService, TrainingModelService],
})
export class ModelsModule {}
