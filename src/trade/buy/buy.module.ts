import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { BuyService } from './buy.service';
import { BuyController } from './buy.controller';
import { GoldPriceService } from 'src/core/services/gold-price.service';

@Module({
  imports: [PrismaModule, AuthModule, JwtModule.register({})],
  controllers: [BuyController],
  providers: [BuyService, PrismaService, GoldPriceService],
  exports: [BuyService],
})
export class BuyModule {}
