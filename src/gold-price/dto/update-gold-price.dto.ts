import { PartialType } from '@nestjs/mapped-types';
import { CreateGoldPriceDto } from './create-gold-price.dto';

export class UpdateGoldPriceDto extends PartialType(CreateGoldPriceDto) {}
