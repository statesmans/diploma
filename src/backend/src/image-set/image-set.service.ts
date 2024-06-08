import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageSetEntity } from 'src/image-set/image-set.entity';
import { Repository } from 'typeorm';
import { ImageSetDto } from './dto/imageSetCreate.dto';

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

  async getAll(): Promise<ImageSetEntity[]> {
    return await this.imageSetRepository.find({
      relations: ['SelectedModel']
    });
  }

  async findOne(id: number): Promise<ImageSetEntity> {
    return await this.imageSetRepository.findOne({
      where: { id },
      relations: ['SelectedModel']
    });
  }

  async create(dto: ImageSetDto): Promise<ImageSetEntity[]> {
    await this.imageSetRepository.save(dto);
    return await this.imageSetRepository.find();
  }

  async update(id: number, dto: ImageSetDto): Promise<ImageSetEntity> {
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
