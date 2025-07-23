import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserPaginatedResponse } from './interfaces/user-paginated.interface';
import { SuperAdminJwtGuard } from 'src/auth/guards/super-admin.guard';

@Controller('admin/users')
@UseGuards(SuperAdminJwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 30,
  ): Promise<UserPaginatedResponse> {
    return this.usersService.findAll(page, limit);
  }

  @Get('count')
  async getTotalUsersCount(): Promise<{ total: number }> {
    const total = await this.usersService.getTotalUsersCount();
    return { total };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.usersService.remove(id);
  }
}
