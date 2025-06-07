import { Transform } from 'class-transformer';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  wages: string;

  @IsString()
  brand: string;

  @IsString()
  type: string;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  gram: number;

  @IsString()
  @IsOptional()
  imgBase64?: string;
}
