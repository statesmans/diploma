import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from './image.entity';
import { Repository } from 'typeorm';
import { LabelClassification, LabelType } from '../label/label.entity';
import { LabelService } from '../label/label.service';
import sizeOf from 'image-size';

import { ImageSetService } from '../image-set/image-set.service';
import { AzureService } from '../azure/azure.service';
import { uuid } from 'uuidv4';

@Injectable()
export class ImageService {

    constructor (
        @InjectRepository(ImageEntity)
        private readonly imageRepository: Repository<ImageEntity>,
        private labelService: LabelService,
        private imageSetService: ImageSetService,
        private azureService: AzureService,

    ) {}




    async uploadImage(
        image: Express.Multer.File,
        imageSetId: number,
    ): Promise<number> {
        const filename = image.originalname;
        const buffer = image.buffer;
        const fileSize = image.size;
        const extension = image.originalname.split('.').pop(); 
        const fileType = image.mimetype;

        const filenameFormatted = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_').toLowerCase();

        const uuidFile = uuid();

        await this.azureService.uploadFile(
            buffer,
            uuidFile,
            filenameFormatted,
        );

        const { width, height } = sizeOf(buffer);
        console.log(width, height)
        if (!width || !height) {
            throw new Error(`Width or height of image is not defined`);
        }

        const imageItem = await this.create({
          filename: filenameFormatted,
          fileSize,
          fileType,
          imageSetId,
          width,
          height,
          uuidFile
        });

        await this.labelService.create({
          imageId: imageItem.id,
          classification: LabelClassification.Unclassified,
          type: LabelType.Manual,
          confidence: null
        });

        await this.imageSetService.increaseImageSetImagesCount(imageSetId, 1);

        return imageItem.id;
    }
    
    async create(imageData: {
        filename: string;
        fileType: string;
        fileSize: number;
        imageSetId: number;
        width: number;
        height: number;
        uuidFile: string;
    }): Promise<ImageEntity> {
        const image = await this.imageRepository.save(imageData);

        return image;
      }
    
      async findAllByImageSetId(imageSetId: number): Promise<ImageEntity[]> {
        return this.imageRepository.findBy({
          imageSetId
        });
      }
    
      async findOne(id: number): Promise<ImageEntity> {
        return this.imageRepository.findOneBy({ id });
      }
    
      async update(id: number, updateData: Partial<ImageEntity>): Promise<ImageEntity> {
        const image = await this.imageRepository.preload({
          id: id,
          ...updateData,
        });
        if (!image) {
          throw new Error('Image not found!');
        }
        return this.imageRepository.save(image);
      }
    
      async delete(id: number): Promise<void> {
        await this.imageRepository.delete(id);

        await this.labelService.removeByImageId(id)
      }

    async findImageByFileUuid(uuidFile: string) {
      return await this.imageRepository.findOneBy({
        uuidFile
      });
    }
}
