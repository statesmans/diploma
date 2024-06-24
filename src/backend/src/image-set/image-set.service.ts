import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageSetEntity } from 'src/image-set/image-set.entity';
import { ILike, Repository } from 'typeorm';
import { ImageSetCreateDto, ImageSetUpdateDto } from './dto/imageSetCreate.dto';
import { ImageSetQueryDto } from './dto/image-set-query.dto';

@Injectable()
export class ImageSetService {

  constructor(
    @InjectRepository(ImageSetEntity) 
    private imageSetRepository: Repository<ImageSetEntity>,

  ) {}

  async increaseImageSetImagesCount(imageSetId: number, amount: number): Promise<void> {
    const imageSet = await this.findOne(imageSetId);
    imageSet.imagesCount += amount;
    await this.imageSetRepository.save(imageSet);
  }

  async decreaseImageSetImagesCount(imageSetId: number, amount: number): Promise<void> {
    const imageSet = await this.findOne(imageSetId);
    imageSet.imagesCount -= amount;
    await this.imageSetRepository.save(imageSet);
  }

  async getAll(query: ImageSetQueryDto = {}): Promise<ImageSetEntity[]> {
    return await this.imageSetRepository.find({
      where: {
        ...(query.search?.length && {
          name: ILike(`${query.search}%`)
        })
      },
      relations: ['SelectedModel']
    });
  }

  async findOne(id: number): Promise<ImageSetEntity> {
    return await this.imageSetRepository.findOne({
      where: { id },
      relations: ['SelectedModel']
    });
  }

  async create(dto: ImageSetCreateDto): Promise<ImageSetEntity> {
    return await this.imageSetRepository.save(dto);
  }

  async update(id: number, dto: ImageSetUpdateDto): Promise<ImageSetEntity> {
    const imageSet = await this.findOne(id);

    if (!imageSet) throw new NotFoundException('ImageSet not found');

    return await this.imageSetRepository.save({
      ...imageSet,
      ...dto
    });
  }

  async delete(id: number): Promise<void> {
    const imageSet = await this.findOne(id);

    if (!imageSet) throw new NotFoundException('ImageSet not found');

    await this.imageSetRepository.delete(id);
  }
}
