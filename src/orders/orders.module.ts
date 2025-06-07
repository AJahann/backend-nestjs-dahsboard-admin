import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { BasketService } from 'src/basket/basket.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, JwtModule.register({}), AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, BasketService],
})
export class OrdersModule {}
