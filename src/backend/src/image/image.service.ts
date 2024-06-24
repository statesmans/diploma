import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from './image.entity';
import { ILike, Repository } from 'typeorm';
import { LabelClassification, LabelType } from '../label/label.entity';
import { LabelService } from '../label/label.service';
import sizeOf from 'image-size';

import { ImageSetService } from '../image-set/image-set.service';
import { AzureService } from '../azure/azure.service';
import { uuid } from 'uuidv4';
import { ImageQueryDto } from './dto/image-query.dto';
import { IPaginated } from 'src/interfaces';

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
        const fileType = image.mimetype;

        const filenameFormatted = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_').toLowerCase();

        const uuidFile = uuid();

        await this.azureService.uploadFile(
            buffer,
            this.azureService.getAzureFilename(filenameFormatted, uuidFile),
        );

        const { width, height } = sizeOf(buffer);
        
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
    
      async findAllByImageSetId(imageSetId: number, query?: ImageQueryDto): Promise<IPaginated<ImageEntity>> {
        const builder = this.imageRepository.createQueryBuilder('image')

        builder.where('image.imageSetId = :imageSetId', { imageSetId });

        if (query?.limit) {
          builder.limit(query.limit);
        }

        if (query?.offset) {
          builder.offset(query.offset);
        }

        if (query?.search) {
          builder.andWhere('image.filename LIKE :search', { search: `%${query.search}%` });
        }

        if (query.manualClassification) {
            builder.leftJoin('image.Labels', 'ManualLabel', 'ManualLabel.imageId = image.id');
            builder.andWhere('ManualLabel.type = :manualType', { manualType: LabelType.Manual });
        } 

        if (query.automaticClassification) {
          builder.leftJoin('image.Labels', 'AiLabel', 'AiLabel.imageId = image.id');
          builder.andWhere('AiLabel.type = :aiType', { aiType: LabelType.Inferred });
        } 

        if (query.manualClassification === 'Unclassified') {
          builder.andWhere('ManualLabel.classification = :manualClassification', { manualClassification: LabelClassification.Unclassified });
        }

        if (query.manualClassification === 'Defect') {
          builder.andWhere('ManualLabel.classification = :manualClassification', { manualClassification: LabelClassification.Defect });
        }

        if (query.manualClassification === 'OK') {
          builder.andWhere('ManualLabel.classification = :manualClassification', { manualClassification: LabelClassification.OK });
        }

        if (Number(+query.manualClassification)) {
          builder.andWhere('ManualLabel.defect_class_id = :manualClassification', { manualClassification: +query.manualClassification });
        }

        builder.orderBy('created_at', 'ASC');


        const [images, count] = await builder.getManyAndCount();

        return {
          data: images,
          total: count
        };
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
        const image = await this.findOne(id);

        await this.imageRepository.delete(id);

        await this.labelService.removeByImageId(id);

        await this.imageSetService.decreaseImageSetImagesCount(id, 1);

        await this.azureService.deleteFile(
          this.azureService.getAzureFilename(image.uuidFile, image.filename),
        );
      }

    async findImageByFileUuid(uuidFile: string) {
      return await this.imageRepository.findOneBy({
        uuidFile
      });
    }
}
