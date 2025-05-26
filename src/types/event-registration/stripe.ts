export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface ProcessPaymentRequest {
  paymentIntentId: string;
  registrationData: any; // Use a more specific type based on your registration form
}

export interface ProcessPaymentResponse {
  success: boolean;
  message: string;
  orderId?: string;
  error?: string;
}

export interface ApplyPromoCodeRequest {
  promoCode: string;
  eventId: string;
  ticketSelections: Array<{
    ticketId: string;
    quantity: number;
  }>;
}

export interface ApplyPromoCodeResponse {
  valid: boolean;
  discountAmount?: number;
  discountPercentage?: number;
  discountedTotal: number;
  originalTotal: number;
  promoCode?: string;
  error?: string;
}
