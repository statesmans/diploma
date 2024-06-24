import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ModelEntity } from './models.entity';
import { TrainingManifest, ModelCreateDto, ModelUpdateDto, InferenceManifest, InferenceResponse } from './dto/model.dto';
import { ImageEntity } from 'src/image/image.entity';
import { AzureService } from 'src/azure/azure.service';
import { LabelClassification, LabelEntity, LabelType } from 'src/label/label.entity';
import { TrainingModelService } from './training-model/training-model.service';
import { DefectClassService } from 'src/defect-class/defect-class.service';
import { ModelQueryDto } from './dto/model-query.dto';

@Injectable()
export class ModelsService {
  private readonly logger = new Logger(ModelsService.name);

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

  async getAll(query: ModelQueryDto = {}): Promise<ModelEntity[]> {
    return await this.modelRepository.find({
      where: {
        ...(query.search && { name: ILike(`${query.search}%`) }),
      },
      relations: ['TrainingSet']
    });
  }

  async getOne(id: string): Promise<ModelEntity> {
    return await this.modelRepository.findOneBy({ id });
  }

  async create(dto: ModelCreateDto): Promise<ModelEntity> {
    return this.modelRepository.save({
      name: dto.name,
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
    const model = await this.modelRepository.findOneBy({ id });
    await this.modelRepository.delete(id);

    if (model.trainingResultFileUuid) {
      await this.azureService.deleteFile(model.trainingResultFileUuid);
    }
  }

  async startTraining(id: string): Promise<void> {
    const model = await this.modelRepository.findOne({
      where: { id },
      relations: [
        'TrainingSet',
      ]
    });

    const manifest = await this.createTrainingManifest(
      id,
      model.TrainingSet.id,
    )

    const trainingResultFileUuid = await this.modelTrainingService.startTraining(manifest, model.hyperparameter || {});

    await this.update(model.id, {
      ...model,
      trainingResultFileUuid
    })
  }

  async predictImageSet(modelId: string, imageSetId: number): Promise<void> {
    const model = await this.modelRepository.findOne({
      where: { id: modelId },
    });

    const imageSetImages = await this.imageRepository.createQueryBuilder('image')
      .leftJoinAndSelect('image.ManualLabel', 'ManualLabel', 'ManualLabel.imageId = image.id')
      .where('image.image_set_id = :id', { id: imageSetId })
      .getMany();

    let manifest = await this.createPredictionManifest(
      modelId,
      imageSetImages,
    );

    try {
      const predictionResult = await this.modelTrainingService.predict(manifest, model.hyperparameter || {});

      await this.savePredictionResult(predictionResult, modelId);

    } catch (e) {
      console.log(e)
    }
  }

  async predictImage(modelId: string, imageId: number): Promise<void> {
    const model = await this.modelRepository.findOne({
      where: { id: modelId },
    });

    const image = await this.imageRepository.findOne({
      where: { id: imageId },
    });

    const manifest = await this.createPredictionManifest(
      modelId,
      [image],
    );

    const predictionResult = await this.modelTrainingService.predict(manifest, model.hyperparameter || {});
    await this.savePredictionResult(predictionResult, modelId);

  }

  async savePredictionResult(predictionResult: InferenceResponse, modelId: string) {
    for (const uuid_file in predictionResult) {
      const labels = predictionResult[uuid_file];

      for (const labelName in labels) {
        const labelData = labels[labelName];

        const image = await this.imageRepository.findOne({
          where: { uuidFile: uuid_file },
        });
  
        try {

          await this.labelRepository.upsert({
            imageId: image.id,
            defectClassId: labelData.defect_class_id,
            confidence: labelData.confidence,
            type: LabelType.Inferred,
            modelUuid: modelId,
            labelData: {
              xy: labelData.bbox,
              confidence: labelData.confidence,
              vid: labelData.defect_class_id,
            },
            // id = 1 is OK label
            classification: labelData.defect_class_id === 1 ? LabelClassification.OK : LabelClassification.Defect,
          }, [
            'imageId',
            'type',
            'modelUuid'
          ]);
        } catch (e) {
          console.log(e)
        }
      }
     

    }
  }

  async createTrainingManifest(
    modelId: string,
    traninigSetId: number,
  ) {
    let manifest: TrainingManifest = {
      model_uuid: modelId,
      images: {},
      defects: {},
      labels: {},
    };

    const defects = await this.defectClassService.getAllWithDeleted();

    
      defects.map(defect => {
        manifest.defects[defect.id] = defect.name ? String(defect.name) : `deleted_defect_${defect.id}`
      })

    const trainigSetImages = await this.imageRepository.createQueryBuilder('image')
      .leftJoinAndSelect('image.ManualLabel', 'ManualLabel', 'ManualLabel.imageId = image.id')
      .where('image.image_set_id = :id', { id: traninigSetId })
      .getMany()

    trainigSetImages.map(image => {
      const label = image.ManualLabel;
      if (!label?.labelData?.xy?.length) return; 

      manifest.images[image.uuidFile] = image.filename;
      manifest.labels[image.uuidFile] = {
        label_data: label.labelData.xy.join(" "),
        defect_id: label.defectClassId,
      }
    });

    return manifest;
  }

  async createPredictionManifest(
    modelId: string,
    images: ImageEntity[]
  ) {
    let manifest: InferenceManifest = {
      model_uuid: modelId,
      images: {},
      defects: {},
    };

    const defects = await this.defectClassService.getAllWithDeleted();

    defects.map(defect => {
    manifest.defects[defect.id] = defect.name ? String(defect.name) : `deleted_defect_${defect.id}`
    })

    images.map(image => {
      manifest.images[image.uuidFile] = image.filename;
    });

    return manifest
  }
}
