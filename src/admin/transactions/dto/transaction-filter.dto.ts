import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum TradeActionType {
  BUY_GOLD = 'BUY_GOLD',
  SELL_GOLD = 'SELL_GOLD',
  ALL_TRADES = 'ALL_TRADES',
}

type TradeAction = 'BUY_GOLD' | 'SELL_GOLD';

export class TransactionFilterDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(TradeActionType)
  tradeType?: TradeActionType;
}

export interface TradeTransaction {
  id: string;
  createdAt: Date;
  action: TradeAction;
  goldAmount: number;
  user: {
    id: string;
    phone: string;
  };
}

export type TransactionFilter = Partial<TransactionFilterDto>;
