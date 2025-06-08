import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateGoldPriceDto {
  @IsNumber()
  @IsPositive()
  buyPrice: number;

  @IsNumber()
  @IsPositive()
  sellPrice: number;

  @IsString()
  updatedBy: string;
}
