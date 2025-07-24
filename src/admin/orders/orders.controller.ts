import { Controller, Get, Put, Param, Query, Body, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SuperAdminJwtGuard } from 'src/auth/guards/super-admin.guard';

@ApiTags('orders')
@Controller('admin/orders')
@UseGuards(SuperAdminJwtGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('count')
  @ApiOperation({ summary: 'Get total order count' })
  async getOrderCount(@Query('userId') userId?: string) {
    return { count: await this.ordersService.getOrderCount(userId) };
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent orders' })
  async getRecentOrders(@Query('limit') limit: number = 10, @Query('userId') userId?: string) {
    return this.ordersService.getRecentOrders(limit, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  async getAllOrders(@Query('userId') userId?: string) {
    return this.ordersService.getAllOrders(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  async getOrderById(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.updateOrderStatus(id, updateOrderDto);
  }
}
