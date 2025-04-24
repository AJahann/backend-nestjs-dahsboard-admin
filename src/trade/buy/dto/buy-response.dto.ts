export class BuyGoldResponseDto {
  success: boolean;
  transactionId: string;
  grams: number;
  totalAmount: number;
  fee: number;
  newBalance: {
    gold: number;
    cash: number;
  };
}
