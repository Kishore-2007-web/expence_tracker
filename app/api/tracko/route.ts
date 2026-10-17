import { NextRequest, NextResponse } from 'next/server';
import { 
  filterTransactionsByWorkspace,
  getCurrentMonthRange,
  getPreviousMonthRange,
  filterTransactionsByDate,
  calculateCashflow,
  getCategoryBreakdown,
  comparePeriods,
  forecastMonthEnd,
  detectAnomalies,
  assessAffordability,
  generateReportData,
  TransactionAnomaly,
  CategoryBreakdown,
  CashflowSummary
} from '@/lib/tracko-engine';
import { Transaction, SavingsGoal } from '@/lib/mock-db';

interface TrackoRequestBody {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  workspaceId: string | null;
  workspaceName: string;
  workspaceType: 'Personal' | 'Business';
  currency: string;
  transactions: Transaction[];
  savingsGoals?: SavingsGoal[];
  action?: 'chat' | 'report' | 'forecast' | 'affordability' | 'anomalies';
  amountParam?: number; // For affordability e.g. 5000
}

export async function POST(req: NextRequest) {
  try {
    const body: TrackoRequestBody = await req.json();
    const {
      message = '',
      history = [],
      workspaceId = null,
      workspaceName = 'Personal Workspace',
      workspaceType = 'Personal',
      currency = 'USD',
      transactions = [],
      savingsGoals = [],
      action = 'chat',
      amountParam
    } = body;

    // 1. Strict Workspace Isolation
    const authorizedTransactions = filterTransactionsByWorkspace(transactions, workspaceId);

    // 2. Deterministic Calculation Grounding
    const currentMonth = getCurrentMonthRange();
    const previousMonth = getPreviousMonthRange();
    const currentMonthTxs = filterTransactionsByDate(authorizedTransactions, currentMonth.startDate, currentMonth.endDate);

    const cashflow = calculateCashflow(currentMonthTxs, currentMonth.label, currency);
    const categories = getCategoryBreakdown(currentMonthTxs);
    const comparison = comparePeriods(authorizedTransactions, currentMonth, previousMonth, currency);
    const forecast = forecastMonthEnd(authorizedTransactions);
    const anomalies = detectAnomalies(authorizedTransactions);

    // 3. Intent Detection & Targeted Tool Execution
    const query = (message || '').toLowerCase();
    let structuredWidget: any = null;

    // Check for specific financial intents
    const isReportRequest = action === 'report' || query.includes('report') || query.includes('summary of my finances') || query.includes('monthly financial report');
    const isComparisonRequest = query.includes('compare') || query.includes('last month') || query.includes('month-over-month');
    const isCategoryRequest = query.includes('where did my money go') || query.includes('category') || query.includes('categories') || query.includes('spending breakdown') || query.includes('spend the most');
    const isAffordabilityRequest = action === 'affordability' || query.includes('can i afford') || query.includes('afford');
    const isForecastRequest = action === 'forecast' || query.includes('forecast') || query.includes('predict') || query.includes('month-end') || query.includes('run rate');
    const isAnomalyRequest = action === 'anomalies' || query.includes('unusual') || query.includes('anomaly') || query.includes('duplicate');

    let affordabilityResult = null;
    if (isAffordabilityRequest) {
      // Parse potential amount from query if not provided
      let purchaseAmount = amountParam ? amountParam * 100 : 0;
      if (!purchaseAmount) {
        const match = query.match(/(\d[\d,]*)/);
        if (match) {
          purchaseAmount = Math.round(parseFloat(match[1].replace(/,/g, '')) * 100);
        }
      }
      if (purchaseAmount > 0) {
        affordabilityResult = assessAffordability(authorizedTransactions, purchaseAmount, currency);
        structuredWidget = {
          type: 'affordability',
          data: affordabilityResult
        };
      }
    }

    if (isReportRequest) {
      const reportData = generateReportData(
        transactions, 
        savingsGoals, 
        workspaceId ? { id: workspaceId, name: workspaceName } as any : null, 
        { currency } as any
      );
      structuredWidget = {
        type: 'report',
        data: reportData
      };
    } else if (isComparisonRequest) {
      structuredWidget = {
        type: 'comparison',
        data: comparison
      };
    } else if (isCategoryRequest) {
      structuredWidget = {
        type: 'categories',
        data: categories.slice(0, 5)
      };
    } else if (isForecastRequest) {
      structuredWidget = {
        type: 'forecast',
        data: forecast
      };
    } else if (isAnomalyRequest && anomalies.length > 0) {
      structuredWidget = {
        type: 'anomalies',
        data: anomalies
      };
    } else if (!structuredWidget && cashflow.transactionCount > 0) {
      // Default companion widget
      structuredWidget = {
        type: 'cashflow',
        data: cashflow
      };
    }

    // 4. Gemini AI Provider or Deterministic Fallback
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

    if (apiKey && apiKey !== 'your_openai_or_gemini_api_key') {
      try {
        const aiResponse = await callGeminiProvider({
          apiKey,
          message,
          history,
          workspaceName,
          workspaceType,
          currency,
          cashflow,
          categories,
          comparison,
          forecast,
          anomalies,
          affordabilityResult
        });

        return NextResponse.json({
          reply: aiResponse,
          provider: 'Gemini AI',
          status: 'online',
          mascotMood: anomalies.length > 0 && isAnomalyRequest ? 'concern' : isAffordabilityRequest && affordabilityResult && !affordabilityResult.canAfford ? 'concern' : 'responding',
          widget: structuredWidget,
          workspaceId,
          timestamp: new Date().toISOString()
        });
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to deterministic TRACKO engine:', err.message);
      }
    }

    // 5. High-Fidelity Deterministic Fallback Synthesis
    const fallbackNarrative = buildDeterministicResponse({
      query,
      workspaceName,
      currency,
      cashflow,
      categories,
      comparison,
      forecast,
      anomalies,
      affordabilityResult,
      isReportRequest,
      isComparisonRequest,
      isCategoryRequest,
      isForecastRequest,
      isAnomalyRequest
    });

    let mood = 'responding';
    if (anomalies.length > 0 && isAnomalyRequest) mood = 'concern';
    if (affordabilityResult && !affordabilityResult.canAfford) mood = 'concern';
    if (cashflow.netCashflowCents > 0 && !isAnomalyRequest) mood = 'success';

    return NextResponse.json({
      reply: fallbackNarrative,
      provider: 'TRACKO Local Deterministic Engine',
      status: 'offline_capable',
      mascotMood: mood,
      widget: structuredWidget,
      workspaceId,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('TRACKO API Error:', error);
    return NextResponse.json(
      { 
        error: 'Unable to process TRACKO financial request.',
        details: error.message || 'Internal error'
      },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------------
// External AI Provider: Google Gemini
// ----------------------------------------------------------------------------

async function callGeminiProvider(params: {
  apiKey: string;
  message: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  workspaceName: string;
  workspaceType: string;
  currency: string;
  cashflow: CashflowSummary;
  categories: CategoryBreakdown[];
  comparison: any;
  forecast: any;
  anomalies: TransactionAnomaly[];
  affordabilityResult: any;
}): Promise<string> {
  const systemInstruction = `
You are TRACKO, the official cute and professional AI financial companion for "My Pocket Tracker".
Personality:
- Friendly, intelligent, reassuring, concise, transparent.
- Ground EVERY number strictly in the deterministic financial calculations provided below.
- NEVER invent transactions, totals, or balances.
- If data is empty or missing, clearly state it.
- Format all currency figures cleanly with "${params.currency}".
- Active workspace: ${params.workspaceName} (${params.workspaceType}).

VERIFIED FINANCIAL CALCULATIONS FOR ${params.cashflow.periodLabel}:
- Total Inflows: ${(params.cashflow.incomeCents / 100).toFixed(2)} ${params.currency}
- Total Outflows: ${(params.cashflow.expenseCents / 100).toFixed(2)} ${params.currency}
- Net Cashflow: ${(params.cashflow.netCashflowCents / 100).toFixed(2)} ${params.currency}
- Recorded Transactions: ${params.cashflow.transactionCount}
- Top Expense Categories: ${params.categories.slice(0, 5).map(c => `${c.category} (${(c.amountCents / 100).toFixed(2)} ${params.currency}, ${c.percentage}%)`).join(', ') || 'No expenses logged'}
- Month-End Projected Outflow (Run-Rate Estimate): ${(params.forecast.forecastMonthEndCents / 100).toFixed(2)} ${params.currency} (${params.forecast.confidence} confidence)
${params.anomalies.length > 0 ? `- Anomalies Detected: ${params.anomalies.map(a => `${a.description} (${(a.amountCents / 100).toFixed(2)} ${params.currency}): ${a.reason}`).join('; ')}` : '- Anomalies Detected: None'}
${params.affordabilityResult ? `- Affordability Assessment for ${(params.affordabilityResult.purchaseAmountCents / 100).toFixed(2)} ${params.currency}: ${params.affordabilityResult.recommendation}` : ''}
`.trim();

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${params.apiKey}`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\nUser Question: ${params.message}` }]
    }
  ];

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
    signal: AbortSignal.timeout(9000)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API returned status ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API returned empty response candidate.');
  }

  return text.trim();
}

// ----------------------------------------------------------------------------
// Deterministic Natural Language Synthesis (Always Works, Zero Network Needed)
// ----------------------------------------------------------------------------

function buildDeterministicResponse(params: {
  query: string;
  workspaceName: string;
  currency: string;
  cashflow: CashflowSummary;
  categories: CategoryBreakdown[];
  comparison: any;
  forecast: any;
  anomalies: TransactionAnomaly[];
  affordabilityResult: any;
  isReportRequest: boolean;
  isComparisonRequest: boolean;
  isCategoryRequest: boolean;
  isForecastRequest: boolean;
  isAnomalyRequest: boolean;
}): string {
  const { 
    cashflow, 
    categories, 
    comparison, 
    forecast, 
    anomalies, 
    affordabilityResult, 
    currency, 
    workspaceName,
    isReportRequest,
    isComparisonRequest,
    isCategoryRequest,
    isForecastRequest,
    isAnomalyRequest
  } = params;

  // 1. Empty state
  if (cashflow.transactionCount === 0) {
    return `Hey! In **${workspaceName}**, there are no recorded transactions for ${cashflow.periodLabel} yet. Once you log your first income or expense, I will break down your cash flow, category distributions, and projections here!`;
  }

  // 2. Affordability
  if (affordabilityResult) {
    const purchaseFormatted = `${(affordabilityResult.purchaseAmountCents / 100).toFixed(2)} ${currency}`;
    const postFormatted = `${(affordabilityResult.postPurchaseCashflowCents / 100).toFixed(2)} ${currency}`;
    if (affordabilityResult.canAfford) {
      return `Yes, you can afford this purchase of **${purchaseFormatted}** in **${workspaceName}**! Your current net cash flow this month is **${(cashflow.netCashflowCents / 100).toFixed(2)} ${currency}**, leaving a projected surplus of **${postFormatted}** after this expense.`;
    } else {
      return `Cautious! A purchase of **${purchaseFormatted}** would exceed your recorded net surplus for this month by **${Math.abs(affordabilityResult.postPurchaseCashflowCents / 100).toFixed(2)} ${currency}**. I recommend holding off or funding this from separate reserves to avoid negative monthly cashflow.`;
    }
  }

  // 3. Reports
  if (isReportRequest) {
    const topCatName = categories[0]?.category || 'General';
    const topCatPct = categories[0]?.percentage || 0;
    return `Here is your verified financial report for **${workspaceName}** (${cashflow.periodLabel}):
- **Total Inflows**: ${(cashflow.incomeCents / 100).toFixed(2)} ${currency}
- **Total Outflows**: ${(cashflow.expenseCents / 100).toFixed(2)} ${currency}
- **Net Cash Flow**: ${(cashflow.netCashflowCents / 100).toFixed(2)} ${currency} (${cashflow.savingsRatePercent}% net margin)
- **Top Outflow Category**: ${topCatName} (${topCatPct}% of spend)
- **Projected Month-End Spend**: ~${(forecast.forecastMonthEndCents / 100).toFixed(2)} ${currency} (Estimate)

You can preview the detailed report card below or download the printable PDF!`;
  }

  // 4. Comparison
  if (isComparisonRequest) {
    const changeWord = comparison.expenseChangeCents >= 0 ? 'increased' : 'decreased';
    const absChange = Math.abs(comparison.expenseChangeCents / 100).toFixed(2);
    return `Comparing **${comparison.currentPeriod.periodLabel}** against **${comparison.previousPeriod.periodLabel}** for **${workspaceName}**:
- **Expenses**: ${changeWord} by **${absChange} ${currency}** (${comparison.expenseChangePercent}% change).
- **Inflows**: ${(comparison.currentPeriod.incomeCents / 100).toFixed(2)} ${currency} vs ${(comparison.previousPeriod.incomeCents / 100).toFixed(2)} ${currency} previously.
- **Net Cashflow Shift**: ${(comparison.netChangeCents / 100).toFixed(2)} ${currency}.
${comparison.topIncreasedCategories.length > 0 ? `Highest spending acceleration occurred in **${comparison.topIncreasedCategories[0].category}** (+${(comparison.topIncreasedCategories[0].increaseCents / 100).toFixed(2)} ${currency}).` : ''}`;
  }

  // 5. Category breakdown
  if (isCategoryRequest) {
    const top3 = categories.slice(0, 3).map((c, i) => `${i + 1}. **${c.category}**: ${(c.amountCents / 100).toFixed(2)} ${currency} (${c.percentage}%)`).join('\n');
    return `In **${workspaceName}**, you have spent **${(cashflow.expenseCents / 100).toFixed(2)} ${currency}** across ${categories.length} categories this month:\n\n${top3}\n\nCheck the breakdown chart below for the full distribution!`;
  }

  // 6. Forecast
  if (isForecastRequest) {
    return `Based on your daily run-rate of **${(forecast.dailyRunRateCents / 100).toFixed(2)} ${currency}/day** across ${forecast.elapsedDays} recorded days, your estimated month-end outflow is **~${(forecast.forecastMonthEndCents / 100).toFixed(2)} ${currency}** (Estimate, ${forecast.confidence} confidence).`;
  }

  // 7. Anomalies
  if (isAnomalyRequest && anomalies.length > 0) {
    return `I flagged **${anomalies.length} unusual transaction(s)** in **${workspaceName}** for your review:\n` +
      anomalies.map(a => `• **${a.description}** (${(a.amountCents / 100).toFixed(2)} ${currency}) on ${a.date} — ${a.reason}`).join('\n');
  }

  // 8. General Financial Summary Greeting
  return `In **${workspaceName}** for ${cashflow.periodLabel}:
- **Income**: ${(cashflow.incomeCents / 100).toFixed(2)} ${currency}
- **Expenses**: ${(cashflow.expenseCents / 100).toFixed(2)} ${currency}
- **Net Cashflow**: **${(cashflow.netCashflowCents / 100).toFixed(2)} ${currency}** (${cashflow.savingsRatePercent}% savings rate)

What specific aspect of your spending or business metrics would you like to explore?`;
}
