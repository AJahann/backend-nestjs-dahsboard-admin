/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GoldPriceService } from './gold-price.service';
import { CreateGoldPriceDto } from './dto/create-gold-price.dto';
import { UpdateGoldPriceDto } from './dto/update-gold-price.dto';
import { GoldPrice } from './entities/gold-price.entity';

@ApiTags('Gold Price Management')
@Controller('gold-price')
export class GoldPriceController {
  constructor(private readonly goldPriceService: GoldPriceService) {}

  // @Post()
  // @ApiOperation({ summary: 'Create new gold price entry' })
  // @ApiResponse({ status: 201, type: GoldPrice })
  // create(@Body() createGoldPriceDto: CreateGoldPriceDto) {
  //   return this.goldPriceService.create(createGoldPriceDto);
  // }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest gold prices' })
  @ApiResponse({
    status: 200,
    description: 'Returns { buyPrice, sellPrice }',
  })
  getLatestPrices() {
    return this.goldPriceService.getLatestPrices();
  }

  // @Get('history')
  // @ApiOperation({ summary: 'Get price history' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Returns array of historical prices',
  // })
  // getHistory(@Query('limit') limit: number = 30) {
  //   return this.goldPriceService.getPriceHistory(Number(limit));
  // }

  // @Get()
  // @ApiOperation({ summary: 'Get all gold price entries' })
  // @ApiResponse({ status: 200, type: [GoldPrice] })
  // findAll() {
  //   return this.goldPriceService.findAll();
  // }

  // @Get(':id')
  // @ApiOperation({ summary: 'Get specific gold price entry' })
  // @ApiResponse({ status: 200, type: GoldPrice })
  // findOne(@Param('id') id: string) {
  //   return this.goldPriceService.findOne(id);
  // }

  // @Patch(':id')
  // @ApiOperation({ summary: 'Update gold price entry' })
  // @ApiResponse({ status: 200, type: GoldPrice })
  // update(@Param('id') id: string, @Body() updateGoldPriceDto: UpdateGoldPriceDto) {
  //   return this.goldPriceService.update(id, updateGoldPriceDto);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Delete gold price entry' })
  // @ApiResponse({ status: 200, type: GoldPrice })
  // remove(@Param('id') id: string) {
  //   return this.goldPriceService.remove(id);
  // }
}
