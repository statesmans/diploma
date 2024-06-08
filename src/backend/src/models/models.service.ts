import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelEntity } from './models.entity';
import { Manifest, ModelCreateDto, ModelUpdateDto } from './dto/model.dto';
import { ImageEntity } from 'src/image/image.entity';
import { AzureService } from 'src/azure/azure.service';
import { LabelEntity } from 'src/label/label.entity';

@Injectable()
export class ModelsService {

  constructor(
    @InjectRepository(ModelEntity) 
    private modelRepository: Repository<ModelEntity>,
    @InjectRepository(ImageEntity) 
    private imageRepository: Repository<ImageEntity>,
    @InjectRepository(LabelEntity) 
    private labelRepository: Repository<LabelEntity>,
    private azureService: AzureService,
  ) {}

  async getAll(): Promise<ModelEntity[]> {
    return await this.modelRepository.find();
  }

  async getOne(id: string): Promise<ModelEntity> {
    return await this.modelRepository.findOneBy({ id });
  }

  async findOne(id: string): Promise<ModelEntity> {
    return await this.modelRepository.findOneOrFail({
        where: { id },
    });
  }

  async create(dto: ModelCreateDto): Promise<ModelEntity> {
    return this.modelRepository.save({
      name: dto.name,
      testSet: dto.testSet,
      trainingSet: dto.trainingSet
    });
  }

  async update(id: string, dto: ModelUpdateDto): Promise<ModelEntity> {
    return await this.modelRepository.save({
      id,
      ...dto
    });
  }

  async delete(id: string): Promise<void> {
    await this.modelRepository.delete(id);
  }

  async startTraining(id: string): Promise<void> {
    const model = await this.modelRepository.findOne({
      where: { id },
      relations: [
        'TrainingSet',
        'TestSet'
      ]
    });

    console.log(model);

    const manifest = this.createTrainingManifest(
      id,
      model.TrainingSet.id,
      model.TestSet.id,
    )
  }

  async createTrainingManifest(
    modelId: string,
    traninigSetId: number,
    testSetId: number,
  ) {
    let manifest: Manifest = {
      train: {},
      test: {},
      defectIds: [],
      labels: {},
    };

    

    const trainigSetImages = await this.imageRepository.createQueryBuilder('image')
      .leftJoinAndSelect('image.ManualLabel', 'ManualLabel', 'ManualLabel.imageId = image.id')
      .where('image.image_set_id = :id', { id: traninigSetId })
      // .getQueryAndParameters();
      .getMany()

    const testSetImages = await this.imageRepository.createQueryBuilder('image')
      .where('image.image_set_id = :id', { id: testSetId })
      .leftJoin('image.ManualLabel', 'ManualLabel')
      .getMany();

      console.log(trainigSetImages)
    // const labels = await this.labelRepository.createQueryBuilder('label')
    //   .where(
    //     'label.image_id IN (:...ids)', 
    //     { 
    //       ids: [
    //         ...trainigSetImages.map(image => image.id),
    //         ...testSetImages.map(image => image.id) 
    //       ]
    //     }
    //   )
    //   .getMany();

    
    trainigSetImages.map(image => {
      // const label = labels.find(label => label.imageId === image.id);
      const label = image.ManualLabel;
      if (!label?.labelData?.xy?.length) return; 

      manifest.train[image.uuidFile] = this.azureService.getAzureFilename(image.filename, image.uuidFile);
      manifest.labels[image.uuidFile] = {
        labelData: label.labelData.xy.join(" "),
        defectId: label.defectClassId,
      }
    });

    testSetImages.map(image => {
      // const label = labels.find(label => label.imageId === image.id);
      const label = image.ManualLabel;

      if (!label?.labelData?.xy?.length) return; 

      manifest.test[image.uuidFile] = this.azureService.getAzureFilename(image.filename, image.uuidFile)
      manifest.labels[image.uuidFile] = {
        labelData: label.labelData.xy.join(" "),
        defectId: label.defectClassId,
      }
    });

    console.log(manifest);
  }
}
