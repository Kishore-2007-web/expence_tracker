"use client";

import React from 'react';

export interface AdBannerProps {
  placementKey?: 'dashboard' | 'reports' | 'settings';
}

export const AdBanner: React.FC<AdBannerProps> = () => {
  return null; // Ads completely removed - 100% free app
};

export default AdBanner;
