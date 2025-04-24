import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoldPriceService } from 'src/core/services/gold-price.service';
import { SellController } from './sell.controller';
import { SellService } from './sell.service';

@Module({
  imports: [PrismaModule, AuthModule, JwtModule.register({})],
  controllers: [SellController],
  providers: [SellService, PrismaService, GoldPriceService],
  exports: [SellService],
})
export class SellModule {}
