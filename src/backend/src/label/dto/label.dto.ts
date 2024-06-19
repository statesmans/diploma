import { IsEnum, IsInt, IsJSON, IsNumber, IsOptional } from 'class-validator';
import { LabelClassification } from '../label.entity';
import { LabelInterface } from 'src/lib/label';
export class CreateLabelDto {
    @IsInt()
    imageId: number;

    @IsInt()
    @IsOptional()
    confidence?: number;

    @IsEnum(LabelClassification)
    classification: LabelClassification;

    @IsInt()
    @IsOptional()
    defectClassId?: number | null;

    @IsJSON()
    labelData?: LabelInterface;

    @IsNumber()
    type: number;
}

export class UpdateLabelDto {
    @IsInt()
    @IsOptional()
    imageId?: number;

    @IsInt()
    @IsOptional()
    confidence?: number;

    @IsEnum(LabelClassification)
    @IsOptional()
    classification?: LabelClassification;

    @IsInt()
    @IsOptional()
    defectClassId?: number | null;

    @IsOptional()
    labelData?: LabelInterface;
}