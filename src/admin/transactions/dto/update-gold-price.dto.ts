import { IsNumber, IsPositive } from 'class-validator';

export class UpdateGoldPriceDto {
  @IsNumber()
  @IsPositive()
  buyPrice: number;

  @IsNumber()
  @IsPositive()
  sellPrice: number;
}
