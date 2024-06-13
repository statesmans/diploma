
import * as Joi from "joi";
import { JoiSchema } from "nestjs-joi";

export class ModelCreateDto {
    @JoiSchema(Joi.string().required())
    name: string;

    @JoiSchema(Joi.number().default(null))
    trainingSet: number | null;

    @JoiSchema(Joi.number().default(null))
    testSet: number | null;
}

export const ModelCreateSchemaDto = Joi.object({
    name: Joi.string().required(),
    trainingSet: Joi.number().allow(null),
    testSet: Joi.number().allow(null),
});

export class ModelUpdateDto {
    @JoiSchema(Joi.string().optional())
    name: string;

    @JoiSchema(Joi.number().allow(null))
    trainingSet: number | null;

    @JoiSchema(Joi.number().allow(null))
    testSet: number | null;

    @JoiSchema(Joi.string().allow(null))
    trainingResultFileUuid: string | null;
}

export const ModelUpdateSchemaDto = Joi.object({
    name: Joi.string().optional(),
    trainingSet: Joi.number().allow(null),
    testSet: Joi.number().allow(null),
});

export interface Hyperparameters {
    yolo_fine_tune: 1 | 0

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

export interface InferenceManifest {
    model_uuid: string,
    images: {
        [key: string]: string,
    };
}

export interface InferenceResponse {

}