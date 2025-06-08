import { Body, Controller, Post, Req, UseGuards, HttpCode } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { DepositDto } from './dto/deposit.dto';
import { DepositResponseDto } from './dto/deposit-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('wallet/deposit')
@UseGuards(JwtAuthGuard)
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Post()
  @HttpCode(200)
  async deposit(@Req() req, @Body() depositDto: DepositDto): Promise<DepositResponseDto> {
    return this.depositService.processDeposit(req.user.sub, depositDto.amount, depositDto.cardId);
  }
}
