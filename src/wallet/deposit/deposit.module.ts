import { Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { DepositController } from './deposit.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CardsModule } from 'src/account/cards/cards.module';

@Module({
  imports: [PrismaModule, CardsModule, JwtModule.register({})],
  controllers: [DepositController],
  providers: [DepositService, PrismaService],
  exports: [DepositService],
})
export class DepositModule {}
