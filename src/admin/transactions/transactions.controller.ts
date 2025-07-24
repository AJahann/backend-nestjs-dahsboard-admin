import { Controller, Get, Put, Body, Query, UseGuards, Req } from '@nestjs/common';
import { UpdateGoldPriceDto } from './dto/update-gold-price.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { SuperAdminJwtGuard } from 'src/auth/guards/super-admin.guard';
import { TransactionsService } from './transactions.service';

@Controller('admin/transactions')
@UseGuards(SuperAdminJwtGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('gold-prices/current')
  async getCurrentGoldPrices() {
    return this.transactionsService.getCurrentGoldPrices();
  }

  @Put('gold-prices')
  async updateGoldPrices(@Req() req, @Body() dto: UpdateGoldPriceDto) {
    return this.transactionsService.updateGoldPrices(req.user.sub, dto);
  }

  @Get('gold-prices/history')
  async getGoldPriceHistory() {
    return this.transactionsService.getPriceHistory();
  }

  @Get('trades')
  async getTradeTransactions(@Query() filter: TransactionFilterDto) {
    return this.transactionsService.getTradeTransactions(filter);
  }
}
