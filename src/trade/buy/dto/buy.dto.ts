import { IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class BuyGoldDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(100_000, { message: 'حداقل خرید ۱۰۰,۰۰۰ تومان است' })
  amount: number;
}
