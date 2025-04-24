import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CardsModule } from 'src/account/cards/cards.module';
import { WithdrawController } from './withdraw.controller';
import { WithdrawService } from './withdraw.service';

@Module({
  imports: [PrismaModule, CardsModule, JwtModule.register({})],
  controllers: [WithdrawController],
  providers: [WithdrawService, PrismaService],
  exports: [WithdrawService],
})
export class WithdrawModule {}
