import { Module } from '@nestjs/common';
import { UsersModule } from './admin/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './account/cards/cards.module';
import { DepositModule } from './wallet/deposit/deposit.module';
import { WithdrawModule } from './wallet/withdraw/withdraw.module';
import { BuyModule } from './trade/buy/buy.module';
import { SellModule } from './trade/sell/sell.module';
import { GoldPriceModule } from './gold-price/gold-price.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    CardsModule,
    DepositModule,
    WithdrawModule,
    BuyModule,
    SellModule,
    GoldPriceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
