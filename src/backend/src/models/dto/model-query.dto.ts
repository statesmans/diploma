import { IsOptional, IsString, MinLength } from "class-validator";

export class ModelQueryDto {
  @MinLength(1)
  @IsOptional()
  @IsString()
  search?: string;
}