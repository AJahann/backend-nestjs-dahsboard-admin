import { IsString, Length, Matches } from 'class-validator';

export class SignUpDto {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(11)
  @Matches(/^09[0-9]{9}$/, {
    message: 'Phone number must start with 09 and have 11 digits',
  })
  phone: string;

  @IsString()
  @Length(6, 100)
  password: string;
}
