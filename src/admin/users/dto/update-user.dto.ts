import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(3, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(11)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(6, 100)
  password?: string;
}
