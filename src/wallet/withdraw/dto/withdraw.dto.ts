import { IsNumber, Min, IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class WithdrawDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(10000, { message: 'حداقل برداشت ۱۰,۰۰۰ تومان است' })
  amount: number;

  @IsString()
  @IsNotEmpty()
  cardId: string;
}
