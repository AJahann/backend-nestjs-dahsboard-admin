import { IsNumber, IsPositive, Max } from 'class-validator';

export class CreateGoldPriceDto {
  @IsNumber()
  @IsPositive()
  @Max(10_000_000)
  buyPrice: number;

  @IsNumber()
  @IsPositive()
  @Max(10_000_000)
  sellPrice: number;
}
