import { Module } from '@nestjs/common';
import { GoldPriceService } from './gold-price.service';
import { GoldPriceController } from './gold-price.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, JwtModule.register({})],
  controllers: [GoldPriceController],
  providers: [GoldPriceService, PrismaService],
  exports: [GoldPriceService],
})
export class GoldPriceModule {}
