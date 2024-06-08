import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from '../image.entity';
import { Repository } from 'typeorm';
import { AzureService } from 'src/azure/azure.service';

@Injectable()
export class ImagesService {
    constructor (
        @InjectRepository(ImageEntity)
        private readonly imageRepository: Repository<ImageEntity>,
        private azureService: AzureService,
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
            filename,
            fileUuid
        );
    }
}
