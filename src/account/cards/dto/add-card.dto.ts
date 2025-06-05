import { IsString, Length, Matches, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddCardDto {
  @IsNotEmpty({ message: 'شماره کارت نمی‌تواند خالی باشد' })
  @IsString({ message: 'شماره کارت باید رشته باشد' })
  @Length(16, 16, { message: 'شماره کارت باید 16 رقمی باشد' })
  @Matches(/^[0-9]+$/, { message: 'شماره کارت باید فقط شامل اعداد باشد' })
  @Transform(({ value }) => value.replace(/\s+/g, '')) // Remove spaces
  cardNumber: string;

  @IsNotEmpty({ message: 'نام کارت نمی‌تواند خالی باشد' })
  @IsString({ message: 'نام کارت باید رشته باشد' })
  @Length(2, 50, { message: 'نام کارت باید بین 2 تا 50 کاراکتر باشد' })
  cardName: string;
}
