export interface GoogleSheetsConfig {
  spreadsheetId: string;
  credentials: {
    client_email: string;
    private_key: string;
  };
}

export interface SheetConfig {
  sheetName: string;
  headers: string[];
  sheetId: number;
}

export interface LogRegistrationRequest {
  eventId: string;
  registrationData: any; // Use a more specific type based on your registration form
  orderId: string;
  paymentStatus: 'paid' | 'free' | 'pending' | 'failed';
  amountPaid: number;
  currency: string;
  paymentMethod: string;
  promoCode?: string;
  discountApplied?: number;
}

export interface LogRegistrationResponse {
  success: boolean;
  rowNumber?: number;
  error?: string;
}
