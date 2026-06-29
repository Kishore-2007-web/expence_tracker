// Ad Manager Service for MoneyFlow Pro

export interface AdPlacement {
  id: string;
  name: string;
  provider: 'adsense' | 'admob';
  type: 'banner' | 'native' | 'promotional';
  fallbackText: string;
}

const PLACEMENTS: Record<string, AdPlacement> = {
  dashboard: {
    id: 'placement-dash-bottom',
    name: 'Dashboard Bottom Banner',
    provider: 'adsense',
    type: 'banner',
    fallbackText: 'Grow your business faster with MoneyFlow Pro Premium. Unlock AI insights now.'
  },
  reports: {
    id: 'placement-reports-native',
    name: 'Reports Page Native Banner',
    provider: 'adsense',
    type: 'native',
    fallbackText: 'Simplify tax filing. Compare multiple businesses on a single graph.'
  },
  settings: {
    id: 'placement-settings-promo',
    name: 'Settings Promotional Banner',
    provider: 'adsense',
    type: 'promotional',
    fallbackText: 'Refer a friend and get 3 months of Premium free. Use coupon code: REFERRAL3'
  }
};

class AdManagerClass {
  private enabled = true;
  private currentTier: 'free' | 'premium' = 'free';

  setTier(tier: 'free' | 'premium') {
    this.currentTier = tier;
  }

  shouldShowAds(): boolean {
    if (this.currentTier === 'premium') return false;
    return this.enabled;
  }

  getPlacement(location: keyof typeof PLACEMENTS): AdPlacement | null {
    if (!this.shouldShowAds()) return null;
    return PLACEMENTS[location] || null;
  }

  toggleAds(state: boolean) {
    this.enabled = state;
  }
}

export const AdManager = new AdManagerClass();
export default AdManager;
