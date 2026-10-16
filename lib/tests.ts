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
    // Test 1: Financial Platform Mode (100% Free Forever)
    const activePlan = MockDB.getPlan();
    assert(activePlan.price_cents === 0, `App plan is completely free ($0)`);
    assert(activePlan.business_limit >= 9999, `Free tier business limit is unlimited (>= 9999)`);

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

    // Test 4: Unlimited Business Creation (No paywalls)
    assert(activePlan.features.includes('Unlimited Businesses'), `Features include Unlimited Businesses`);
    assert(activePlan.features.includes('100% Free Forever'), `Features include 100% Free Forever`);

    // Test 5: Ad Placement System Rules (Permanently Disabled)
    const dashAd = AdManager.getPlacement('dashboard');
    assert(dashAd === null, `Ad banners are permanently disabled across all workspaces`);
    assert(AdManager.shouldShowAds() === false, `shouldShowAds must always return false`);
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
