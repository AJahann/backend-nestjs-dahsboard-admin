import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CardsService } from 'src/account/cards/cards.service';

@Module({
  imports: [PrismaModule, AuthModule, JwtModule.register({})],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, CardsService],
})
export class UsersModule {}
