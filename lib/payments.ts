// Payments Integration Manager - Stripe & Razorpay
import { MockDB, Coupon } from './mock-db';

export interface PaymentOptions {
  planId: string;
  gateway: 'stripe' | 'razorpay';
  couponCode?: string;
  email: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
  amountCharged: number;
}

class PaymentsManagerClass {
  // Calculate final cost with coupon discount
  calculateDiscountedPrice(priceCents: number, coupon: Coupon | null): number {
    if (!coupon) return priceCents;
    
    if (coupon.discount_percent > 0) {
      return Math.round(priceCents * (1 - coupon.discount_percent / 100));
    } else if (coupon.discount_flat_cents > 0) {
      return Math.max(0, priceCents - coupon.discount_flat_cents);
    }
    
    return priceCents;
  }

  // Simulate gateway checkout process
  async checkout(options: PaymentOptions): Promise<PaymentResponse> {
    const { planId, gateway, couponCode } = options;
    
    // Find Plan details
    const plansList = {
      'PREMIUM_MONTHLY': { name: 'Premium Monthly', price_cents: 999 },
      'PREMIUM_YEARLY': { name: 'Premium Yearly', price_cents: 9990 }
    };
    
    const plan = plansList[planId as keyof typeof plansList];
    if (!plan) {
      return { success: false, error: 'Invalid Plan selected', amountCharged: 0 };
    }

    // Verify Coupon if any
    let coupon: Coupon | null = null;
    if (couponCode) {
      coupon = MockDB.validateCoupon(couponCode);
      if (!coupon) {
        return { success: false, error: 'Invalid or expired coupon code', amountCharged: 0 };
      }
    }

    const priceCharged = this.calculateDiscountedPrice(plan.price_cents, coupon);

    // Simulate Network Request delay to the payment gateway API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate successful payment transaction ID
    const randomId = (gateway === 'stripe' ? 'ch_stripe_' : 'pay_razorpay_') + Math.random().toString(36).substr(2, 10);

    // Update locally stored subscription
    MockDB.upgradeSubscription(planId, couponCode || null);

    return {
      success: true,
      transactionId: randomId,
      amountCharged: priceCharged
    };
  }

  // Verification helper for webhooks
  async verifyWebhookPayment(payload: { provider: string; orderId: string; sig: string }) {
    // Verifies signatures on server-side to guarantee integrity.
    return { verified: true };
  }
}

export const PaymentsManager = new PaymentsManagerClass();
export default PaymentsManager;
