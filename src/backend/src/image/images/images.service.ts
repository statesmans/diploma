import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from '../image.entity';
import { In, Repository } from 'typeorm';
import { AzureService } from 'src/azure/azure.service';
import { LabelService } from 'src/label/label.service';
import { LabelEntity } from 'src/label/label.entity';
import { ImageSetService } from 'src/image-set/image-set.service';

@Injectable()
export class ImagesService {
    constructor (
        @InjectRepository(ImageEntity)
        private readonly imageRepository: Repository<ImageEntity>,
        @InjectRepository(LabelEntity)
        private readonly labelRepository: Repository<LabelEntity>,
        private azureService: AzureService,
        private imageSetService: ImageSetService,
    ) {}

    async getAllByImageSetId(imageSetId: number) {
        return await this.imageRepository.findBy({
            imageSetId,
        });
    }

    async downloadImage(
        filename: string,
        fileUuid: string,
    ) {
        return await this.azureService.createAzureFileStream(
            this.azureService.getAzureFilename(filename, fileUuid)
        );
    }

    async deleteImageBulk(ids: Array<string | number>, imageSetId: number): Promise<any> {

        if (ids[0] === 'all') {
            const images = await this.imageRepository.findBy({
                imageSetId
            })
            await this.imageRepository.delete({
                imageSetId
            });

            await this.labelRepository.delete({
                imageId: In(images.map(image => image.id))
            })
            await this.imageSetService.decreaseImageSetImagesCount(imageSetId, images.length);

        } else {
            await this.imageRepository.delete(ids as Array<number>);
            await this.labelRepository.delete({
                imageId: In(ids as Array<number>)
            })
            await this.imageSetService.decreaseImageSetImagesCount(imageSetId, ids.length);

        }


    }
}
