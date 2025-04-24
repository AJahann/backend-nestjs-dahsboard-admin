import { IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class BuyGoldDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0.1, { message: 'حداقل خرید ۰.۱ گرم است' })
  grams: number;
}
