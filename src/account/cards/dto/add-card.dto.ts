import { IsString, Length, Matches } from 'class-validator';

export class AddCardDto {
  @IsString()
  @Length(16, 16, { message: 'شماره کارت باید 16 رقمی باشد' })
  @Matches(/^[0-9]+$/, { message: 'شماره کارت باید فقط شامل اعداد باشد' })
  cardNumber: string;

  @IsString()
  @Length(2, 50, { message: 'نام کارت باید بین 2 تا 50 کاراکتر باشد' })
  cardName: string;
}
