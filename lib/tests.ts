// MoneyFlow Pro - Local Validation Suite
import { MockDB, PLANS } from './mock-db';
import { PaymentsManager } from './payments';
import { AdManager } from './ads-manager';

export function runValidationSuite() {
  console.log("=== MONEYFLOW PRO AUTOMATED VALIDATION SUITE ===");
  const results = { passed: 0, failed: 0, logs: [] as string[] };

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      results.passed++;
      results.logs.push(`✅ PASS: ${message}`);
    } else {
      results.failed++;
      results.logs.push(`❌ FAIL: ${message}`);
    }
  };

  try {
    // Test 1: Validate Coupon Discounts
    const monthlyPlan = PLANS.find(p => p.id === 'PREMIUM_MONTHLY')!;
    const priceCents = monthlyPlan.price_cents; // 999 cents ($9.99)
    
    // 20% discount coupon
    const save20 = MockDB.validateCoupon('SAVE20');
    const discountedPrice = PaymentsManager.calculateDiscountedPrice(priceCents, save20);
    assert(discountedPrice === Math.round(999 * 0.8), `SAVE20 coupon should apply 20% off ($7.99 vs ${discountedPrice / 100})`);

    // Test 2: Free User Limit Restriction (Max 3 businesses)
    // Clear businesses first
    MockDB.save(); 
    const currentBizCount = MockDB.getBusinesses().length;
    assert(currentBizCount <= 3, "Free plan should initialize with standard pre-seeded businesses <= 3");

    // Test 3: Ad system placement for Free user
    AdManager.setTier('free');
    const dashAd = AdManager.getPlacement('dashboard');
    assert(dashAd !== null, "Free tier should receive bottom dashboard banner sponsorship");

    AdManager.setTier('premium');
    const premiumDashAd = AdManager.getPlacement('dashboard');
    assert(premiumDashAd === null, "Premium tier must never show advertisements");

    console.log(`Validation results: ${results.passed} passed, ${results.failed} failed.`);
    results.logs.forEach(log => console.log(log));
  } catch (error: any) {
    console.error("Test runner crashed:", error);
    results.failed++;
  }

  return results;
}
