import { IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(11)
  phone: string;

  @IsString()
  @Length(6, 100)
  password: string;
}
