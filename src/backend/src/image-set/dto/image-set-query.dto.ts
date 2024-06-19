import { IsOptional, IsString, MinLength } from "class-validator";

export class ImageSetQueryDto {
  @MinLength(1)
  @IsOptional()
  @IsString()
  search?: string;
}