import { IsOptional, IsString } from "class-validator";

export class ImageSetCreateDto {
    @IsOptional()
    @IsString()
    selectedModel: string | null;
    
    @IsString()
    name: string;
}

export class ImageSetUpdateDto {
    @IsOptional()
    @IsString()
    selectedModel: string | null;
    
    @IsString()
    @IsOptional()
    name: string;
}