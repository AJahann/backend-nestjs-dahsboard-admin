import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserPaginatedResponse } from './interfaces/user-paginated.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: createUserDto.phone },
    });

    if (existingUser) {
      throw new ConflictException('creat user error: this account already exist.');
    }

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        phone: createUserDto.phone,
        password: await bcrypt.hash(createUserDto.password, 10),
        wallet: {
          create: {
            goldAmount: 0,
            cashBalance: 0,
          },
        },
      },
    });

    return new UserResponseDto(user);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<UserPaginatedResponse> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          wallet: true,
          cards: true,
          actions: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map((user) => new UserResponseDto(user)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        cards: true,
        actions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return new UserResponseDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const newData = {
      ...(updateUserDto.name && { name: updateUserDto?.name }),
      ...(updateUserDto?.password && { password: await bcrypt.hash(updateUserDto.password, 10) }),
    };

    const user = await this.prisma.user.update({
      where: { id },
      data: newData,
      include: {
        wallet: true,
        cards: true,
        actions: true,
      },
    });

    return new UserResponseDto(user);
  }

  async remove(id: string) {
    // First check if user exists
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Use a transaction to ensure all deletions succeed or fail together
    return this.prisma.$transaction(async (prisma) => {
      // Delete related records in the correct order
      await prisma.basketItem.deleteMany({ where: { userId: id } });
      await prisma.action.deleteMany({ where: { userId: id } });
      await prisma.card.deleteMany({ where: { userId: id } });
      await prisma.wallet.deleteMany({ where: { userId: id } });

      // Finally delete the user
      try {
        await prisma.user.delete({ where: { id } });

        return {
          success: true,
        };
      } catch (error) {
        console.error('Error deleting user:', error);
        return {
          success: false,
        };
      }
    });
  }

  async getTotalUsersCount(): Promise<number> {
    return this.prisma.user.count();
  }
}
