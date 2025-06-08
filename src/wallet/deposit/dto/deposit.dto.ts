import { IsNumber, Min, IsString } from 'class-validator';

export class DepositDto {
  @IsNumber()
  @Min(10000, { message: 'حداقل واریز ۱۰,۰۰۰ تومان است' })
  amount: number;

  @IsString()
  cardId: string;
}
