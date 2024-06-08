import { IsOptional, IsString } from "class-validator";

export class ImageSetDto {
    @IsOptional()
    @IsString()
    selectedModel: string | null;
    
    @IsString()
    name: string;
}