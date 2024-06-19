import { Type } from "class-transformer";
import { IsInt, IsNumber, IsObject, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import * as Joi from "joi";

export class ModelCreateDto {
    @IsString()
    name: string;

    @IsNumber()
    @Type(() => Number)
    trainingSet: number | null;
}

export class HyperparameterDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    batch_size?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    epochs?: number;

    @IsOptional()
    @IsNumber()
    @Min(0.1)
    @Max(1)
    train_size_coeficient?: number;

    @IsOptional()
    @IsInt()
    target_image_size?: number;

    @IsOptional()
    @IsString()
    YOLO_model_name?: string;

    @IsOptional()
    @Type(() => Number)
    fine_tune_YOLOv8?: number;
}

export class ModelUpdateDto {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    trainingSet?: number | null;
  
    @IsOptional()
    @IsString()
    trainingResultFileUuid?: string | null;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => HyperparameterDto)
    hyperparameter?: HyperparameterDto | null;
  }



export interface Hyperparameters {
    batch_size?: number;
    epochs?: number;
    train_size_coeficient?: number;
    target_image_size?: number;
    YOLO_model_name?: string;
}

export interface TrainingManifest {
    model_uuid: string;
    defects: {
        [key: string]: string
    };
    images: {
        [key: string]: string,
    };
    labels: {
        [key: string]: {
            label_data: string,
            defect_id: number
        }
    }
}

export interface InferenceManifest extends Omit<TrainingManifest, 'labels'>  {}

interface InferenceLabelDataResponse {
    // Defect name (OK is also defect)
    [key: string]: {
        bbox: [number, number, number, number],
        confidence: number,
        defect_class_id: number
    }
}

export interface InferenceResponse {
    // uuid_file of the image
    [key: string]: InferenceLabelDataResponse

}