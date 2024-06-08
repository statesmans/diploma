
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
}

export const ModelUpdateSchemaDto = Joi.object({
    name: Joi.string().optional(),
    trainingSet: Joi.number().allow(null),
    testSet: Joi.number().allow(null),
});


export interface Manifest {
    defectIds: number[];
    test: {
        [key: string]: string,
    };
    train: {
        [key: string]: string,
    };
    labels: {
        [key: string]: {
            labelData: string,
            defectId: number
        }
    }
}