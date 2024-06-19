import { IsString, MinLength } from "class-validator";

export class CreateDefectClassDto {
  @IsString()
  @MinLength(1)
  name: string;

}