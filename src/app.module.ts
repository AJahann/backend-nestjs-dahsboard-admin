import { Module } from '@nestjs/common';
import { UsersModule } from './admin/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './account/cards/cards.module';
import { DepositModule } from './wallet/deposit/deposit.module';
import { WithdrawModule } from './wallet/withdraw/withdraw.module';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, CardsModule, DepositModule, WithdrawModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
