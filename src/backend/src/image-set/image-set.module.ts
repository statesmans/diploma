import { Module } from '@nestjs/common';
import { ImageSetController } from './image-set.controller';
import { ImageSetService } from './image-set.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageSetEntity } from './image-set.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageSetEntity]),
  ],
  controllers: [ImageSetController],
  providers: [ImageSetService],
  exports: [ImageSetService, TypeOrmModule],
})
export class ImageSetModule {}
