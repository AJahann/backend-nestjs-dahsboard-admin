import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { CardsService } from 'src/account/cards/cards.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cardsService: CardsService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: signUpDto.phone },
    });

    if (existingUser) {
      throw new ConflictException('این شماره موبایل قبلا ثبت شده است');
    }

    const hashedPassword = await this.hashPassword(signUpDto.password);
    const user = await this.prisma.user.create({
      data: {
        phone: signUpDto.phone,
        password: hashedPassword,
        name: signUpDto.name,
        wallet: {
          create: {
            goldAmount: 0,
            cashBalance: 0,
          },
        },
      },
    });

    const payload = { sub: user.id, phone: user.phone };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: loginDto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
    }

    const payload = { sub: user.id, phone: user.phone };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
    };
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        basketItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                wages: true,
                gram: true,
                type: true,
                brand: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    const cards = await this.cardsService.getCards(userId);

    const formattedBasket = user.basketItems.map((item) => ({
      id: item.productId,
      name: item.product.name,
      wages: item.product.wages,
      gram: item.product.gram,
      count: item.quantity,
    }));

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      wallet: user.wallet,
      cards,
      basket: formattedBasket,
    };
  }
}
