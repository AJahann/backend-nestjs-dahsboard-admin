import { IsString } from 'class-validator';

export class SignUpDto {
  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsString()
  name: string;
}
