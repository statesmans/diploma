import { forwardRef, Module } from '@nestjs/common';
import { LabelService } from './label.service';
import { LabelController } from './label.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelEntity } from './label.entity';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
        LabelEntity
    ]),
    forwardRef(() => ImageModule)
  ],
  providers: [LabelService],
  controllers: [LabelController],
  exports: [LabelService, TypeOrmModule]
})
export class LabelModule {}
