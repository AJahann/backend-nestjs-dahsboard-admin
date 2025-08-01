import { Transform } from 'class-transformer';
import { IsString, IsNumber, IsOptional, Max, Min } from 'class-validator';

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
  @Max(10)
  @Min(0.1)
  gram: number;

  @IsString()
  @IsOptional()
  imgBase64?: string;
}
