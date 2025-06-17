import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail } from 'class-validator';

export class LoginAdminDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;
}
