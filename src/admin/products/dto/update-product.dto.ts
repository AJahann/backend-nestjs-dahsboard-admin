import { Transform } from 'class-transformer';
import { IsString, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  wages: string;

  @IsString()
  @IsOptional()
  brand: string;

  @IsString()
  @IsOptional()
  type: string;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  @Max(10)
  @Min(0.1)
  @IsOptional()
  gram: number;

  @IsString()
  @IsOptional()
  imgData?: string;
}
