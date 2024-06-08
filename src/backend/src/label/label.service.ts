import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LabelEntity } from './label.entity';
import { Repository } from 'typeorm';
import { CreateLabelDto, UpdateLabelDto } from './dto/label.dto';
import { ImageService } from '../image/image.service';

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

    findImageId(imageId: number): Promise<LabelEntity> {
        return this.labelRepository.findOneBy({
            imageId
        });
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
        const label = await this.findOne(id);
        const { width, height } = await this.imageService.findOne(label.imageId)

        const { xy } = updateLabelDto.labelData;
        const X_center = (xy[3] / 2) + xy[1];
        const Y_center = (xy[4] / 2) + xy[2];

        const X_center_norm = X_center / width;
        const Y_center_norm = Y_center / height;

        const width_norm = xy[3] / width
        const height_norm = xy[4] / height

        

        // const result: UpdateLabelDto = {
        //     ...updateLabelDto,
        //     labelData: {
        //         xy: [
        //             xy[0],
                    // X_center_norm,
                    // Y_center_norm,
                    // width_norm,
                    // height_norm
        //         ]
        //     }
        // }

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
