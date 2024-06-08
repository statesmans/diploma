export interface LabelInterface {
    vid?: string;
    xy: [number, number, number, number, number];
    confidence?: number;
}



export interface Label {
    id: number;
    imageId: number;
    confidence: number;
    // classification: number;
    defectClassId: number;
    labelData: LabelInterface;
}