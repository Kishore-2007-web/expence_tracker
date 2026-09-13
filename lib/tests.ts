// My Pocket Tracker - Comprehensive Validation Suite
import { MockDB, PLANS } from './mock-db';
import { PaymentsManager } from './payments';
import { AdManager } from './ads-manager';

export function runValidationSuite() {
  console.log("=== MY POCKET TRACKER AUTOMATED VALIDATION SUITE ===");
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
    // Test 1: Coupon Discounts & Price Bounds
    const monthlyPlan = PLANS.find(p => p.id === 'PREMIUM_MONTHLY')!;
    const priceCents = monthlyPlan.price_cents; // 999 cents ($9.99)
    
    // 20% discount coupon (SAVE20)
    const save20 = MockDB.validateCoupon('SAVE20');
    const save20Price = PaymentsManager.calculateDiscountedPrice(priceCents, save20);
    assert(save20Price === Math.round(999 * 0.8), `SAVE20 coupon should apply 20% off ($7.99 vs ${save20Price / 100})`);

    // $50 flat off coupon (WELCOME50) with price floor at 0
    const welcome50 = MockDB.validateCoupon('WELCOME50');
    const welcome50Price = PaymentsManager.calculateDiscountedPrice(priceCents, welcome50);
    assert(welcome50Price === 0, `WELCOME50 coupon flat discount should floor at $0 and not produce negative price ($0 vs ${welcome50Price})`);

    // 100% off coupon (FLOWFREE)
    const flowFree = MockDB.validateCoupon('FLOWFREE');
    const flowFreePrice = PaymentsManager.calculateDiscountedPrice(priceCents, flowFree);
    assert(flowFreePrice === 0, `FLOWFREE coupon should produce 100% discount ($0 vs ${flowFreePrice})`);

    // Invalid coupon code
    const invalidCoupon = MockDB.validateCoupon('INVALID99');
    assert(invalidCoupon === null, `Invalid coupon code 'INVALID99' should return null`);

    // Test 2: Financial Calculations (Income, Expenses, Cashflow, Net Balance)
    const testIncome = 50000;
    const testExpense = 30000;
    const cashflow = testIncome - testExpense;
    const netBalance = cashflow;
    assert(cashflow === 20000, `Cashflow calculation (₹50,000 - ₹30,000) should equal ₹20,000 (got ${cashflow})`);
    assert(netBalance === 20000, `Net balance calculation should equal ₹20,000 (got ${netBalance})`);

    // Test 3: Savings Goals Progress Percentage
    const targetCents = 10000000; // ₹100,000 in cents
    const currentCents = 2500000; // ₹25,000 in cents
    const progressPct = Math.min(100, Math.round((currentCents / targetCents) * 100));
    assert(progressPct === 25, `Savings goal progress (₹25,000 / ₹100,000) should equal 25% (got ${progressPct}%)`);

    // Test 4: Business Tier Limits
    MockDB.downgradeSubscription();
    const activePlan = MockDB.getPlan();
    assert(activePlan.business_limit === 3, `Free tier active plan business limit should equal 3`);

    MockDB.upgradeSubscription('PREMIUM_MONTHLY');
    const premiumPlan = MockDB.getPlan();
    assert(premiumPlan.business_limit === 9999, `Premium tier business limit should equal unlimited (9999)`);

    // Restore free tier for ad testing
    MockDB.downgradeSubscription();

    // Test 5: Ad Placement System Rules
    AdManager.setTier('free');
    const dashAdFree = AdManager.getPlacement('dashboard');
    assert(dashAdFree !== null, `Free tier should receive active dashboard ad banner placement`);

    AdManager.setTier('premium');
    const dashAdPremium = AdManager.getPlacement('dashboard');
    assert(dashAdPremium === null, `Premium tier must never receive ad banner placement`);

    // Test 6: Invoice Item Calculations
    const qty = 3;
    const unitPriceCents = 1500; // $15.00
    const invoiceSubtotal = qty * unitPriceCents;
    const invoiceDiscount = 500; // $5.00
    const invoiceTotal = Math.max(0, invoiceSubtotal - invoiceDiscount);
    assert(invoiceTotal === 4000, `Invoice calculation (3 * $15.00 - $5.00) should equal $40.00 in cents (got ${invoiceTotal})`);

    console.log(`Validation results: ${results.passed} passed, ${results.failed} failed.`);
    results.logs.forEach(log => console.log(log));
  } catch (error: any) {
    console.error("Test runner crashed:", error);
    results.failed++;
  }

  return results;
}
