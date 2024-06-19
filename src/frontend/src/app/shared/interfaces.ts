export interface Model {
    id: string,
    name: string,
    trainingSet: number,
    hyperparameter: Record<string, any> | null
    TrainingSet?: ImageSet,
    
}

export interface ModelCreateDto {
    name: string;
    trainingSet?: number | null;
    testSet?: number | null;
}

export interface ModelUpdateDto {
    name?: string
    trainingSet?: number | null;
    testSet?: number | null;
}

export interface ImageSet {
    id: number;
    name: string;
    selectedModel: string | null;
    imagesCount: number;
}

export interface ImageSetCreateDto {
    name: string
}

export interface ImageSetUpdateDto {
    name?: string;
    selectedModel?: string | null;
}

export interface LabelCreateDto {
    imageId: number;
    confidence: number;
    // classification: number;
    defectClassId: number;
    labelData: LabelInterface;
}

export interface LabelUpdateDto {
    // classification: number;
    defectClassId: number;
    labelData: LabelInterface;
} 

export interface Image {
    id: number;
    uuidFile: string;
    filename: string;  
    fileType: string; 
    fileSize: number; 
    imageSetId: number; 
    width: number;
    height: number;
    createdAt: Date
}

export interface LabelInterface {
    vid?: string;
    xy: [number, number, number, number];
    confidence?: number;
}

export interface DefectClass {
    id: number;
    name: string;
}

export enum LabelClassification {
    Unclassified = 0,
    OK = 1,
    Defect = 2,
}

export interface Label {
    id: number;
    imageId: number;
    confidence: number;
    classification: LabelClassification;
    defectClassId: number;
    labelData: LabelInterface;
    modelUuid: string;
    Model?: Model
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
}

export interface CreateDefectClassDto {
    name: string;
}