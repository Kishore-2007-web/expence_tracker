// ============================================================================
// TRACKO AI — Deterministic Financial Analytics & Tool Engine
// All calculations are grounded in real records with decimal-safe cents arithmetic.
// ============================================================================

import { Transaction, Business, SavingsGoal, Profile } from './mock-db';

export interface DateRange {
  startDate: string; // ISO string YYYY-MM-DD
  endDate: string;   // ISO string YYYY-MM-DD
  label: string;
}

export interface CashflowSummary {
  incomeCents: number;
  expenseCents: number;
  netCashflowCents: number;
  savingsRatePercent: number;
  transactionCount: number;
  periodLabel: string;
  currency: string;
}

export interface CategoryBreakdown {
  category: string;
  amountCents: number;
  percentage: number;
  count: number;
}

export interface PeriodComparison {
  currentPeriod: CashflowSummary;
  previousPeriod: CashflowSummary;
  expenseChangeCents: number;
  expenseChangePercent: number;
  incomeChangeCents: number;
  incomeChangePercent: number;
  netChangeCents: number;
  topIncreasedCategories: { category: string; increaseCents: number }[];
}

export interface AffordabilityAssessment {
  canAfford: boolean;
  purchaseAmountCents: number;
  currency: string;
  currentCashflowCents: number;
  postPurchaseCashflowCents: number;
  recommendation: string;
  cautions: string[];
  assumptions: string[];
}

export interface SpendingForecast {
  forecastMonthEndCents: number;
  actualSpendSoFarCents: number;
  projectedAdditionalCents: number;
  elapsedDays: number;
  totalDaysInMonth: number;
  dailyRunRateCents: number;
  methodology: string;
  isEstimate: true;
  confidence: 'High' | 'Moderate' | 'Preliminary';
  limitations: string;
}

export interface TransactionAnomaly {
  transactionId: string;
  description: string;
  amountCents: number;
  category: string;
  date: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DuplicateWarning {
  isDuplicateRisk: boolean;
  confidenceScore: number;
  matchingTransaction?: Transaction;
  reason: string;
}

export interface CategorySuggestion {
  category: string;
  confidence: number; // 0 to 1
  reason: string;
}

export interface FinancialReportData {
  reportId: string;
  workspaceName: string;
  workspaceType: 'Personal' | 'Business';
  currency: string;
  generatedAt: string;
  periodLabel: string;
  cashflow: CashflowSummary;
  categories: CategoryBreakdown[];
  comparison?: PeriodComparison;
  forecast: SpendingForecast;
  anomalies: TransactionAnomaly[];
  savingsGoalsSummary?: {
    goalCount: number;
    totalTargetCents: number;
    totalSavedCents: number;
    overallProgressPercent: number;
  };
  recommendations: string[];
}

// ----------------------------------------------------------------------------
// 1. Workspace Isolation Filter
// ----------------------------------------------------------------------------

export function filterTransactionsByWorkspace(
  transactions: Transaction[],
  targetBusinessId: string | null
): Transaction[] {
  if (targetBusinessId === null) {
    // Personal workspace transactions only (where business_id is null or empty)
    return transactions.filter(t => !t.business_id);
  }
  // Target business transactions only
  return transactions.filter(t => t.business_id === targetBusinessId);
}

// ----------------------------------------------------------------------------
// 2. Date Utilities & Filtering
// ----------------------------------------------------------------------------

export function getMonthDateRange(year: number, monthZeroIndexed: number): DateRange {
  const start = new Date(Date.UTC(year, monthZeroIndexed, 1));
  const end = new Date(Date.UTC(year, monthZeroIndexed + 1, 0, 23, 59, 59, 999));
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    label: `${monthNames[monthZeroIndexed]} ${year}`
  };
}

export function getCurrentMonthRange(): DateRange {
  const now = new Date();
  return getMonthDateRange(now.getUTCFullYear(), now.getUTCMonth());
}

export function getPreviousMonthRange(): DateRange {
  const now = new Date();
  const prevMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return getMonthDateRange(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
}

export function filterTransactionsByDate(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): Transaction[] {
  return transactions.filter(t => {
    const txDate = t.transaction_date.split('T')[0];
    return txDate >= startDate && txDate <= endDate;
  });
}

// ----------------------------------------------------------------------------
// 3. Cashflow Calculation
// ----------------------------------------------------------------------------

export function calculateCashflow(
  transactions: Transaction[],
  periodLabel: string = 'Selected Period',
  currency: string = 'USD'
): CashflowSummary {
  let incomeCents = 0;
  let expenseCents = 0;

  for (const tx of transactions) {
    // Strictly isolate type
    if (tx.type === 'income') {
      incomeCents += Math.round(tx.amount_cents || 0);
    } else if (tx.type === 'expense') {
      expenseCents += Math.round(tx.amount_cents || 0);
    }
  }

  const netCashflowCents = incomeCents - expenseCents;
  const savingsRatePercent = incomeCents > 0 
    ? Math.max(0, Math.round(((incomeCents - expenseCents) / incomeCents) * 100))
    : 0;

  return {
    incomeCents,
    expenseCents,
    netCashflowCents,
    savingsRatePercent,
    transactionCount: transactions.length,
    periodLabel,
    currency
  };
}

// ----------------------------------------------------------------------------
// 4. Category Breakdown
// ----------------------------------------------------------------------------

export function getCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const categoryMap = new Map<string, { amountCents: number; count: number }>();
  let totalExpenseCents = 0;

  for (const tx of expenseTransactions) {
    const cat = tx.category_name || 'Uncategorized';
    const amount = Math.round(tx.amount_cents || 0);
    totalExpenseCents += amount;

    const current = categoryMap.get(cat) || { amountCents: 0, count: 0 };
    categoryMap.set(cat, {
      amountCents: current.amountCents + amount,
      count: current.count + 1
    });
  }

  const results: CategoryBreakdown[] = [];
  for (const [category, data] of categoryMap.entries()) {
    const percentage = totalExpenseCents > 0
      ? Math.round((data.amountCents / totalExpenseCents) * 100)
      : 0;

    results.push({
      category,
      amountCents: data.amountCents,
      percentage,
      count: data.count
    });
  }

  // Sort descending by highest expense
  return results.sort((a, b) => b.amountCents - a.amountCents);
}

// ----------------------------------------------------------------------------
// 5. Month-over-Month Comparison
// ----------------------------------------------------------------------------

export function comparePeriods(
  transactions: Transaction[],
  currentRange: DateRange,
  previousRange: DateRange,
  currency: string = 'USD'
): PeriodComparison {
  const currentTxs = filterTransactionsByDate(transactions, currentRange.startDate, currentRange.endDate);
  const prevTxs = filterTransactionsByDate(transactions, previousRange.startDate, previousRange.endDate);

  const currentSummary = calculateCashflow(currentTxs, currentRange.label, currency);
  const prevSummary = calculateCashflow(prevTxs, previousRange.label, currency);

  const expenseChangeCents = currentSummary.expenseCents - prevSummary.expenseCents;
  const expenseChangePercent = prevSummary.expenseCents > 0
    ? Math.round((expenseChangeCents / prevSummary.expenseCents) * 100)
    : currentSummary.expenseCents > 0 ? 100 : 0;

  const incomeChangeCents = currentSummary.incomeCents - prevSummary.incomeCents;
  const incomeChangePercent = prevSummary.incomeCents > 0
    ? Math.round((incomeChangeCents / prevSummary.incomeCents) * 100)
    : currentSummary.incomeCents > 0 ? 100 : 0;

  const netChangeCents = currentSummary.netCashflowCents - prevSummary.netCashflowCents;

  // Category changes
  const curCategories = getCategoryBreakdown(currentTxs);
  const prevCategories = new Map(getCategoryBreakdown(prevTxs).map(c => [c.category, c.amountCents]));

  const topIncreasedCategories: { category: string; increaseCents: number }[] = [];
  for (const cur of curCategories) {
    const prevAmount = prevCategories.get(cur.category) || 0;
    if (cur.amountCents > prevAmount) {
      topIncreasedCategories.push({
        category: cur.category,
        increaseCents: cur.amountCents - prevAmount
      });
    }
  }
  topIncreasedCategories.sort((a, b) => b.increaseCents - a.increaseCents);

  return {
    currentPeriod: currentSummary,
    previousPeriod: prevSummary,
    expenseChangeCents,
    expenseChangePercent,
    incomeChangeCents,
    incomeChangePercent,
    netChangeCents,
    topIncreasedCategories: topIncreasedCategories.slice(0, 3)
  };
}

// ----------------------------------------------------------------------------
// 6. Affordability Assessment
// ----------------------------------------------------------------------------

export function assessAffordability(
  transactions: Transaction[],
  purchaseAmountCents: number,
  currency: string = 'USD'
): AffordabilityAssessment {
  const currentMonth = getCurrentMonthRange();
  const currentMonthTxs = filterTransactionsByDate(transactions, currentMonth.startDate, currentMonth.endDate);
  const cashflow = calculateCashflow(currentMonthTxs, currentMonth.label, currency);

  const postPurchaseCashflowCents = cashflow.netCashflowCents - purchaseAmountCents;
  const canAfford = postPurchaseCashflowCents >= 0;

  const cautions: string[] = [];
  const assumptions = [
    `Assumes current month income (${(cashflow.incomeCents / 100).toFixed(2)} ${currency}) remains constant.`,
    'Does not account for unrecorded offline commitments or pending invoices.'
  ];

  if (!canAfford) {
    cautions.push(`This purchase exceeds your current net cashflow for this month by ${Math.abs(postPurchaseCashflowCents / 100).toFixed(2)} ${currency}.`);
    cautions.push('Consider deferring until the next cash inflow or splitting into milestones.');
  } else if (postPurchaseCashflowCents < (cashflow.incomeCents * 0.1)) {
    cautions.push('This purchase leaves less than a 10% cash cushion for the remainder of the month.');
  }

  let recommendation = '';
  if (canAfford) {
    recommendation = `You have sufficient net surplus (${(cashflow.netCashflowCents / 100).toFixed(2)} ${currency}) this month to absorb this purchase. Post-purchase balance will be ${(postPurchaseCashflowCents / 100).toFixed(2)} ${currency}.`;
  } else {
    recommendation = `Not recommended at this time without additional income or reducing planned discretionary expenses.`;
  }

  return {
    canAfford,
    purchaseAmountCents,
    currency,
    currentCashflowCents: cashflow.netCashflowCents,
    postPurchaseCashflowCents,
    recommendation,
    cautions,
    assumptions
  };
}

// ----------------------------------------------------------------------------
// 7. Spending Forecasting
// ----------------------------------------------------------------------------

export function forecastMonthEnd(
  transactions: Transaction[],
  now: Date = new Date()
): SpendingForecast {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const range = getMonthDateRange(year, month);
  
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const elapsedDays = Math.max(1, now.getUTCDate());
  const remainingDays = Math.max(0, daysInMonth - elapsedDays);

  const monthTxs = filterTransactionsByDate(transactions, range.startDate, range.endDate);
  const cashflow = calculateCashflow(monthTxs, range.label);

  const actualSpendSoFarCents = cashflow.expenseCents;
  const dailyRunRateCents = Math.round(actualSpendSoFarCents / elapsedDays);
  const projectedAdditionalCents = dailyRunRateCents * remainingDays;
  const forecastMonthEndCents = actualSpendSoFarCents + projectedAdditionalCents;

  const confidence: 'High' | 'Moderate' | 'Preliminary' = 
    elapsedDays >= 20 ? 'High' : elapsedDays >= 7 ? 'Moderate' : 'Preliminary';

  const limitations = elapsedDays < 7 
    ? 'Fewer than 7 days of spending history in this month. Run-rate is sensitive to early outliers.'
    : 'Based on linear daily run-rate extrapolation from actual recorded ledger outflows.';

  return {
    forecastMonthEndCents,
    actualSpendSoFarCents,
    projectedAdditionalCents,
    elapsedDays,
    totalDaysInMonth: daysInMonth,
    dailyRunRateCents,
    methodology: 'Linear Daily Run-Rate Projection',
    isEstimate: true,
    confidence,
    limitations
  };
}

// ----------------------------------------------------------------------------
// 8. Anomaly & Unusual Transaction Detection
// ----------------------------------------------------------------------------

export function detectAnomalies(transactions: Transaction[]): TransactionAnomaly[] {
  const anomalies: TransactionAnomaly[] = [];
  const expenses = transactions.filter(t => t.type === 'expense');

  if (expenses.length < 3) return anomalies;

  // Calculate average expense
  const totalExpenseCents = expenses.reduce((sum, t) => sum + t.amount_cents, 0);
  const avgExpenseCents = totalExpenseCents / expenses.length;
  const outlierThresholdCents = Math.max(avgExpenseCents * 2.5, 10000); // At least $100

  // Category specific averages
  const categoryAmounts = new Map<string, number[]>();
  for (const t of expenses) {
    const list = categoryAmounts.get(t.category_name) || [];
    list.push(t.amount_cents);
    categoryAmounts.set(t.category_name, list);
  }

  for (const t of expenses.slice(0, 50)) { // Inspect recent 50
    const catAmounts = categoryAmounts.get(t.category_name) || [];
    const catAvg = catAmounts.reduce((a, b) => a + b, 0) / catAmounts.length;

    if (t.amount_cents >= outlierThresholdCents && t.amount_cents > catAvg * 2) {
      anomalies.push({
        transactionId: t.id,
        description: t.description,
        amountCents: t.amount_cents,
        category: t.category_name,
        date: t.transaction_date.split('T')[0],
        reason: `Amount is ${(t.amount_cents / catAvg).toFixed(1)}x higher than your average ${t.category_name} expense.`,
        severity: t.amount_cents > outlierThresholdCents * 2 ? 'high' : 'medium'
      });
    }
  }

  return anomalies.slice(0, 5);
}

// ----------------------------------------------------------------------------
// 9. Smart Transaction Categorization
// ----------------------------------------------------------------------------

export const CATEGORY_KEYWORD_RULES: Record<string, string[]> = {
  'Food & Dining': ['swiggy', 'zomato', 'restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonalds', 'grocery', 'supermarket', 'dinner', 'lunch', 'breakfast', 'food', 'market'],
  'Housing & Utilities': ['rent', 'electricity', 'water', 'gas', 'maintenance', 'apartment', 'wifi', 'internet', 'broadband', 'utility', 'power'],
  'Transportation': ['uber', 'ola', 'lyft', 'metro', 'fuel', 'petrol', 'diesel', 'parking', 'flight', 'train', 'bus', 'toll'],
  'Software & Cloud': ['aws', 'google cloud', 'azure', 'github', 'vercel', 'supabase', 'slack', 'notion', 'zoom', 'domain', 'hosting', 'openai'],
  'Entertainment': ['netflix', 'spotify', 'prime', 'cinema', 'movie', 'concert', 'game', 'playstation', 'steam'],
  'Shopping': ['amazon', 'flipkart', 'clothing', 'apparel', 'shoes', 'electronics', 'apple', 'store'],
  'Health & Fitness': ['pharmacy', 'hospital', 'doctor', 'medicine', 'gym', 'fitness', 'dentist', 'clinic'],
  'Payroll & Wages': ['salary', 'payroll', 'contractor', 'freelance fee', 'wages', 'stipend'],
  'Marketing & Ads': ['google ads', 'facebook ads', 'meta ads', 'instagram', 'linkedin ads', 'sponsorship', 'marketing']
};

export function suggestCategory(
  description: string,
  _amountCents: number = 0,
  availableCategories: string[] = []
): CategorySuggestion {
  const desc = (description || '').toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORD_RULES)) {
    for (const kw of keywords) {
      if (desc.includes(kw)) {
        // If the user's available categories contain this or similar, prefer it
        const matchedAvailable = availableCategories.find(c => c.toLowerCase() === category.toLowerCase()) || category;
        return {
          category: matchedAvailable,
          confidence: 0.88,
          reason: `Matched merchant/keyword "${kw}" in description.`
        };
      }
    }
  }

  // Fallback suggestion
  const defaultCategory = availableCategories.length > 0 ? availableCategories[0] : 'General';
  return {
    category: defaultCategory,
    confidence: 0.35,
    reason: 'Suggested general category as a starting point.'
  };
}

// ----------------------------------------------------------------------------
// 10. Duplicate Transaction Detection
// ----------------------------------------------------------------------------

export function detectDuplicateRisk(
  newTx: { amountCents: number; description: string; date?: string; type?: string },
  existingTransactions: Transaction[]
): DuplicateWarning {
  const targetDate = (newTx.date || new Date().toISOString()).split('T')[0];
  const targetDesc = (newTx.description || '').trim().toLowerCase();
  const targetAmount = Math.round(newTx.amountCents || 0);

  for (const existing of existingTransactions) {
    const exDate = existing.transaction_date.split('T')[0];
    const exDesc = (existing.description || '').trim().toLowerCase();
    const exAmount = Math.round(existing.amount_cents || 0);

    // Exact amount + exact date + similar description
    if (exAmount === targetAmount && exDate === targetDate) {
      if (exDesc === targetDesc || exDesc.includes(targetDesc) || targetDesc.includes(exDesc)) {
        return {
          isDuplicateRisk: true,
          confidenceScore: 0.95,
          matchingTransaction: existing,
          reason: `Identical amount (${(exAmount / 100).toFixed(2)}) and description recorded on the same date (${exDate}).`
        };
      }
      return {
        isDuplicateRisk: true,
        confidenceScore: 0.75,
        matchingTransaction: existing,
        reason: `Same amount (${(exAmount / 100).toFixed(2)}) on ${exDate} under "${existing.description}".`
      };
    }
  }

  return {
    isDuplicateRisk: false,
    confidenceScore: 0,
    reason: 'No duplicate transaction pattern detected.'
  };
}

// ----------------------------------------------------------------------------
// 11. Savings Goals Projection
// ----------------------------------------------------------------------------

export function projectSavingsGoalCompletion(
  goal: SavingsGoal,
  monthlySurplusCents: number
): {
  isAchievable: boolean;
  projectedMonths: number;
  projectedCompletionDate: string;
  notes: string;
} {
  const remainingCents = Math.max(0, goal.target_amount_cents - goal.current_amount_cents);

  if (remainingCents === 0) {
    return {
      isAchievable: true,
      projectedMonths: 0,
      projectedCompletionDate: 'Goal Completed',
      notes: 'This goal has already reached 100% target!'
    };
  }

  if (monthlySurplusCents <= 0) {
    return {
      isAchievable: false,
      projectedMonths: -1,
      projectedCompletionDate: 'Indefinite',
      notes: 'Current net monthly cashflow is zero or negative. A positive monthly surplus is needed to project completion.'
    };
  }

  const projectedMonths = Math.ceil(remainingCents / monthlySurplusCents);
  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + projectedMonths);

  const deadlineDate = new Date(goal.deadline);
  const onTime = completionDate <= deadlineDate;

  return {
    isAchievable: onTime,
    projectedMonths,
    projectedCompletionDate: completionDate.toISOString().split('T')[0],
    notes: onTime 
      ? `Projected to reach target in ~${projectedMonths} month(s) at current contribution run-rate.`
      : `At current surplus run-rate, projected completion will occur after your deadline of ${goal.deadline}.`
  };
}

// ----------------------------------------------------------------------------
// 12. Full Report Generator Data Builder
// ----------------------------------------------------------------------------

export function generateReportData(
  transactions: Transaction[],
  savingsGoals: SavingsGoal[],
  business: Business | null,
  profile: Profile
): FinancialReportData {
  const currentMonth = getCurrentMonthRange();
  const previousMonth = getPreviousMonthRange();

  const workspaceTxs = filterTransactionsByWorkspace(transactions, business ? business.id : null);
  const monthTxs = filterTransactionsByDate(workspaceTxs, currentMonth.startDate, currentMonth.endDate);

  const cashflow = calculateCashflow(monthTxs, currentMonth.label, profile.currency);
  const categories = getCategoryBreakdown(monthTxs);
  const comparison = comparePeriods(workspaceTxs, currentMonth, previousMonth, profile.currency);
  const forecast = forecastMonthEnd(workspaceTxs);
  const anomalies = detectAnomalies(workspaceTxs);

  // Recommendations grounded in data
  const recommendations: string[] = [];
  if (cashflow.netCashflowCents > 0) {
    recommendations.push(`Positive cashflow of ${(cashflow.netCashflowCents / 100).toFixed(2)} ${profile.currency}. Consider allocating 20% to emergency reserve or business capital.`);
  } else if (cashflow.netCashflowCents < 0) {
    recommendations.push(`Outflows exceed inflows by ${Math.abs(cashflow.netCashflowCents / 100).toFixed(2)} ${profile.currency}. Review top category (${categories[0]?.category || 'General'}) to curb burn rate.`);
  }

  if (categories.length > 0 && categories[0].percentage > 40) {
    recommendations.push(`${categories[0].category} accounts for ${categories[0].percentage}% of total expenses. Diversifying or negotiating vendors can significantly boost net margins.`);
  }

  let goalsSummary;
  if (!business && savingsGoals.length > 0) {
    const totalTarget = savingsGoals.reduce((sum, g) => sum + g.target_amount_cents, 0);
    const totalSaved = savingsGoals.reduce((sum, g) => sum + g.current_amount_cents, 0);
    const progress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    goalsSummary = {
      goalCount: savingsGoals.length,
      totalTargetCents: totalTarget,
      totalSavedCents: totalSaved,
      overallProgressPercent: progress
    };
  }

  return {
    reportId: `TRK-REP-${Date.now().toString(36).toUpperCase()}`,
    workspaceName: business ? business.name : 'Personal Workspace',
    workspaceType: business ? 'Business' : 'Personal',
    currency: profile.currency,
    generatedAt: new Date().toISOString(),
    periodLabel: currentMonth.label,
    cashflow,
    categories,
    comparison,
    forecast,
    anomalies,
    savingsGoalsSummary: goalsSummary,
    recommendations
  };
}
