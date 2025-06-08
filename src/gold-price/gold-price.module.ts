import { Module } from '@nestjs/common';
import { GoldPriceService } from './gold-price.service';
import { GoldPriceController } from './gold-price.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [GoldPriceController],
  providers: [GoldPriceService, PrismaService],
  exports: [GoldPriceService],
})
export class GoldPriceModule {}
