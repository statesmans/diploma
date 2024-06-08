import { Module } from '@nestjs/common';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelEntity } from './models.entity';
import { ImageModule } from 'src/image/image.module';
import { LabelModule } from 'src/label/label.module';
import { AzureService } from 'src/azure/azure.service';

@Module({
  imports: [ 
    TypeOrmModule.forFeature([ModelEntity]),
    ImageModule,
    LabelModule,
  ],
  controllers: [ModelsController],
  providers: [ModelsService, AzureService],
})
export class ModelsModule {}
