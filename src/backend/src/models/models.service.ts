import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelEntity } from './models.entity';
import { Manifest, ModelCreateDto, ModelUpdateDto } from './dto/model.dto';
import { ImageEntity } from 'src/image/image.entity';
import { AzureService } from 'src/azure/azure.service';
import { LabelEntity } from 'src/label/label.entity';
import { TrainingModelService } from './training-model/training-model.service';
import { DefectClassService } from 'src/defect-class/defect-class.service';

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
    private modelTrainingService: TrainingModelService,
    private defectClassService: DefectClassService
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

    const manifest = await this.createTrainingManifest(
      id,
      model.TrainingSet.id,
      model.TestSet.id,
    )

    const trainingResultFileUuid = await this.modelTrainingService.startTraining(manifest);

    this.update(model.id, {
      ...model,
      trainingResultFileUuid
    })
  }

  async createTrainingManifest(
    modelId: string,
    traninigSetId: number,
    testSetId: number,
  ) {
    let manifest: Manifest = {
      model_uuid: modelId,
      images: {},
      defects: {},
      labels: {},
    };

    const defects = await this.defectClassService.getAll();

    const usedDefects = await this.imageRepository.createQueryBuilder('image')
      .leftJoinAndSelect('image.ManualLabel', 'ManualLabel', 'ManualLabel.imageId = image.id')
      .where('image.image_set_id = :id', { id: traninigSetId })
      .andWhere('ManualLabel.defect_class_id IS NOT NULL')
      .select('DISTINCT ManualLabel.defect_class_id')
      .getRawMany();
    
    usedDefects.map(defect => {
      manifest.defects[defect.defect_class_id] = defects.find(d => d.id === defect.defect_class_id).name;
    })

    const trainigSetImages = await this.imageRepository.createQueryBuilder('image')
      .leftJoinAndSelect('image.ManualLabel', 'ManualLabel', 'ManualLabel.imageId = image.id')
      .where('image.image_set_id = :id', { id: traninigSetId })
      .getMany()

    trainigSetImages.map(image => {
      // const label = labels.find(label => label.imageId === image.id);
      const label = image.ManualLabel;
      if (!label?.labelData?.xy?.length) return; 

      manifest.images[image.uuidFile] = image.filename;
      manifest.labels[image.uuidFile] = {
        label_data: label.labelData.xy.join(" "),
        defect_id: label.defectClassId,
      }
    });

    console.log(manifest);
    return manifest;
  }
}
