import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LabelClassification, LabelEntity, LabelType } from './label.entity';
import { Repository } from 'typeorm';
import { CreateLabelDto, UpdateLabelDto } from './dto/label.dto';
import { ImageService } from '../image/image.service';
import { groupBy } from 'rxjs';

@Injectable()
export class LabelService {

    constructor(
        @Inject(forwardRef(() => ImageService))
        private imageService: ImageService,
        @InjectRepository(LabelEntity)
        private labelRepository: Repository<LabelEntity>,
   
    ) {}

    async create(createLabelDto: CreateLabelDto): Promise<LabelEntity> {
        const label = this.labelRepository.create(createLabelDto);
        return await this.labelRepository.save(label);
    }

    async getManualLabelByImageId(imageId: number): Promise<LabelEntity> {
        return await this.labelRepository
            .createQueryBuilder('label')
            .where('label.type = :labelType', { labelType: LabelType.Manual })
            .andWhere('label.image_id = :imageId', { imageId })
            .getOne();
    }

    async getInferredLabelsByImageId(imageId: number): Promise<LabelEntity[]> {
        return await this.labelRepository
            .createQueryBuilder('label')
            .where('label.type = :labelType', { labelType: LabelType.Inferred })
            .andWhere('label.image_id = :imageId', { imageId })
            .getMany();
    }

    async findAll(): Promise<LabelEntity[]> {
        return await this.labelRepository.find();
    }

    async findAllByImageId(imageId: number): Promise<LabelEntity[]> {
        return await this.labelRepository.findBy({
            imageId
        });
    }

    async findOne(id: number): Promise<LabelEntity> {
        return await this.labelRepository.findOneOrFail({
            where: { id },
        });
    }

    async update(id: number, updateLabelDto: UpdateLabelDto): Promise<LabelEntity> {
        
        if ('defectClassId' in updateLabelDto) {
            if (updateLabelDto.defectClassId === LabelClassification.OK) {
                updateLabelDto.classification = LabelClassification.OK;
            } else {
                updateLabelDto.classification = LabelClassification.Defect;
            }
            
        }

        if ('labelData' in updateLabelDto) {
            if (!updateLabelDto?.labelData?.xy?.length) {
                updateLabelDto.classification = LabelClassification.Unclassified

            }
        }

        await this.labelRepository.update(id, updateLabelDto);
        return this.labelRepository.findOneOrFail({
            where: { id },
        });
    }

    async delete (id: number): Promise<void> {
        await this.labelRepository.delete(id);
    }

    async removeByImageId(imageId: number): Promise<void> {
        const labels = await this.findAllByImageId(imageId);

        labels.map(async (label) => {
            await this.labelRepository.delete(label.id);
        })
    }

}
