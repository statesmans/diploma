import { Module } from '@nestjs/common';
import { DefectClassController } from './defect-class.controller';
import { DefectClassService } from './defect-class.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefectClassEntity } from './defect-class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DefectClassEntity])
  ],
  controllers: [DefectClassController],
  providers: [DefectClassService],
  exports: [DefectClassService, TypeOrmModule]
})
export class DefectClassModule {}
