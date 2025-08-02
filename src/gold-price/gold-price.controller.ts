import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GoldPriceService } from './gold-price.service';
import { CreateGoldPriceDto } from './dto/create-gold-price.dto';
import { GoldPrice } from './entities/gold-price.entity';
import { SuperAdminJwtGuard } from 'src/auth/guards/super-admin.guard';

@ApiTags('Gold Price Management')
@Controller('gold-price')
@UseGuards(SuperAdminJwtGuard)
export class GoldPriceController {
  constructor(private readonly goldPriceService: GoldPriceService) {}

  @Post()
  @ApiOperation({ summary: 'Create new gold price entry' })
  @ApiResponse({ status: 201, type: GoldPrice })
  create(@Req() req, @Body() createGoldPriceDto: CreateGoldPriceDto) {
    return this.goldPriceService.create(req.user.sub, createGoldPriceDto);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest gold prices' })
  @ApiResponse({
    status: 200,
    description: 'Returns { buyPrice, sellPrice }',
  })
  getLatestPrices() {
    return this.goldPriceService.getLatestPrices();
  }

  @Get('history')
  @ApiOperation({ summary: 'Get price history' })
  @ApiResponse({
    status: 200,
    description: 'Returns array of historical prices',
  })
  getHistory(@Query('limit') limit: number = 30) {
    return this.goldPriceService.getPriceHistory(Number(limit));
  }
}
