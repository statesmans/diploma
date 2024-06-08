export interface Model {
    id: number,
    name: string,
    trainingSet: number | null,
    testSet: number | null,
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
}

export interface LabelInterface {
    vid?: string;
    xy: [number, number, number, number, number];
    confidence?: number;
}

export interface DefectClass {
    id: number;
    name: string;
}

// export interface LabelsInterface {
//     [key: string]: LabelInterface;
// }

// export interface LabelData {
//     labels?: LabelInterface;
// }

export interface Label {
    id: number;
    imageId: number;
    confidence: number;
    // classification: number;
    defectClassId: number;
    labelData: LabelInterface;
}