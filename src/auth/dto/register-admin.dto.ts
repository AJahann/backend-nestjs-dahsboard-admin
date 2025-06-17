import { IsString, IsIn, IsNotEmpty, MinLength, MaxLength, IsEmail } from 'class-validator';

export class RegisterAdminDto {
  @IsString()
  @MinLength(3)
  @MaxLength(8)
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(12)
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @IsIn(['SUPER_ADMIN'])
  role: 'SUPER_ADMIN';
}
