import { forwardRef, Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageEntity } from './image.entity';
import { LabelModule } from 'src/label/label.module';
import { AzureService } from 'src/azure/azure.service';
import { ImageSetModule } from 'src/image-set/image-set.module';
import { ImagesController } from './images/images.controller';
import { ImagesService } from './images/images.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageEntity]),
    forwardRef(() => LabelModule),
    ImageSetModule,
  ],
  providers: [ImageService, ImagesService, AzureService],
  controllers: [ImageController, ImagesController],
  exports: [ImageService, ImagesService, TypeOrmModule],
})
export class ImageModule {}
