export class BuyGoldResponseDto {
  success: boolean;
  transactionId: string;
  grams: number;
  amount: number;
  totalCost: number;
  fee: number;
  newBalance: {
    gold: number;
    cash: number;
  };
}
