import { useState, useEffect } from 'react';
import { brandAssetsService } from '@/services/brandAssetsService';

interface BrandAsset {
  brand_name: string;
  domain: string;
  logo_url: string;
  icon_url?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

interface UseBrandAssetsResult {
  brandAssets: BrandAsset | null;
  loading: boolean;
  error: Error | null;
  refreshAssets: () => Promise<void>;
}

export function useBrandAssets(domain: string): UseBrandAssetsResult {
  const [brandAssets, setBrandAssets] = useState<BrandAsset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBrandAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const assets = await brandAssetsService.getBrandAssets(domain);
      setBrandAssets(assets);
    } catch (err) {
      console.error('Error fetching brand assets:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching brand assets'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (domain) {
      fetchBrandAssets();
    }
  }, [domain]);

  const refreshAssets = async () => {
    await fetchBrandAssets();
  };

  return {
    brandAssets,
    loading,
    error,
    refreshAssets
  };
}