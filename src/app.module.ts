import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './account/cards/cards.module';
import { DepositModule } from './wallet/deposit/deposit.module';
import { WithdrawModule } from './wallet/withdraw/withdraw.module';
import { BuyModule } from './trade/buy/buy.module';
import { SellModule } from './trade/sell/sell.module';
import { GoldPriceModule } from './gold-price/gold-price.module';
import { ProductsModule as AdminProductsModule } from './admin/products/products.module';
import { ProductsModule } from './products/products.module';
import { BasketModule } from './basket/basket.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './admin/users/users.module';
import { OrdersModule as AdminOrdersModule } from './admin/orders/orders.module';
import { TransactionsModule } from './admin/transactions/transactions.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CardsModule,
    DepositModule,
    WithdrawModule,
    BuyModule,
    SellModule,
    GoldPriceModule,
    ProductsModule,
    AdminProductsModule,
    BasketModule,
    AdminOrdersModule,
    OrdersModule,
    UsersModule,
    TransactionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
