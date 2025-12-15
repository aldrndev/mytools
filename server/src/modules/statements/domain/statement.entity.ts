export interface Transaction {
  date: string;
  description: string;
  amount: number;
  balance?: number;
  x?: number;
  y?: number;
  style?: any;
}

export interface StatementTemplate {
  bankName?: string;
  accountNumber?: string;
  period?: string;
  initialBalance?: number;
  transactions: Transaction[];
  // Positions for reconstruction (not implemented yet, but placeholder)
  layout?: any;
}
