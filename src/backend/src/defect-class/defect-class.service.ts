import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefectClassEntity } from './defect-class.entity';
import { Repository } from 'typeorm';
import { CreateDefectClassDto } from './dto/defect-class.dto';

@Injectable()
export class DefectClassService {

    constructor (
        @InjectRepository(DefectClassEntity)
        private defectClassRepository: Repository<DefectClassEntity>,
    ) {}

    async getAll() {
        return await this.defectClassRepository.find();
    }

    async getAllWithDeleted() {
        return await this.defectClassRepository.createQueryBuilder('defectClass')
        .withDeleted()
        .getMany();
    }

    async softDelete(id: number) {
        await this.defectClassRepository.update({ id }, { name: null});
        await this.defectClassRepository.softDelete(id);
    }

    async create(dto: CreateDefectClassDto) {
        await this.defectClassRepository.save(dto);
    }
}
