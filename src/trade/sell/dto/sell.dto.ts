import { IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class SellGoldDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0.1, { message: 'حداقل فروش ۰.۱ گرم است' })
  grams: number;
}
