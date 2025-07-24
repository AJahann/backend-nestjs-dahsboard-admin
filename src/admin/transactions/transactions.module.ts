import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { GoldPriceService } from 'src/gold-price/gold-price.service';

@Module({
  imports: [PrismaModule, AuthModule, JwtModule.register({})],
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaService, GoldPriceService],
})
export class TransactionsModule {}
