import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, IsString, Max, Min, MinLength } from "class-validator";

export class ImageQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset: number = 0;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(100)
  @Type(() => Number)
  limit: number = 10;

  @IsOptional()
  manualClassification: string | number;

  @IsOptional()
  @IsString()
  automaticClassification: string;

  @IsOptional()
  @Type(() => Number)
  imageSetId: number;
}