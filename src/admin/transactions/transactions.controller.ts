import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TradeTransaction, TransactionFilterDto } from './dto/transaction-filter.dto';
import { SuperAdminJwtGuard } from 'src/auth/guards/super-admin.guard';
import { TransactionsService } from './transactions.service';

@Controller('admin/transactions')
@UseGuards(SuperAdminJwtGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('trades')
  async getTradeTransactions(@Query() filter: TransactionFilterDto): Promise<TradeTransaction[]> {
    return this.transactionsService.getTradeTransactions(filter);
  }
}
