import { Body, Controller, Post, Req, UseGuards, HttpCode } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawDto } from './dto/withdraw.dto';
import { WithdrawResponseDto } from './dto/withdraw-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('wallet/withdraw')
@UseGuards(JwtAuthGuard)
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @Post()
  @HttpCode(200)
  async withdraw(@Req() req, @Body() withdrawDto: WithdrawDto): Promise<WithdrawResponseDto> {
    return this.withdrawService.processWithdraw(
      req.user.sub,
      withdrawDto.amount,
      withdrawDto.cardId,
    );
  }
}
