import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefectClassEntity } from './defect-class.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DefectClassService {

    constructor (
        @InjectRepository(DefectClassEntity)
        private defectClassRepository: Repository<DefectClassEntity>,
    ) {}

    async getAll() {
        return this.defectClassRepository.find();
    }
}
