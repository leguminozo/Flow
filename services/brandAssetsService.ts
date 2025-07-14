import { supabase } from '@/lib/supabase';

interface BrandAsset {
  id?: number;
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
  api_response?: any;
  created_at?: string;
  updated_at?: string;
}

class BrandAssetsService {
  // Obtener assets de marca desde Supabase
  async getBrandAssets(domain: string): Promise<BrandAsset | null> {
    try {
      console.log(`🔍 Buscando assets de marca para: ${domain}`);
      
      // Primero intentar obtener desde la base de datos
      const { data, error } = await supabase
        .from('brand_assets')
        .select('*')
        .eq('domain', domain)
        .single();
      
      if (error) {
        console.log(`❌ No se encontraron assets en la base de datos: ${error.message}`);
        
        // Si no hay datos en la base de datos, intentar obtener desde la función Edge
        return await this.fetchBrandAssetsFromEdgeFunction(domain);
      }
      
      console.log(`✅ Assets de marca encontrados para: ${domain}`);
      return data;
    } catch (error) {
      console.error('Error obteniendo assets de marca:', error);
      return null;
    }
  }
  
  // Obtener assets de marca desde la función Edge
  private async fetchBrandAssetsFromEdgeFunction(domain: string): Promise<BrandAsset | null> {
    try {
      console.log(`🔄 Obteniendo assets de marca desde función Edge para: ${domain}`);
      
      const { data, error } = await supabase.functions.invoke('fetch-brand-assets', {
        body: { domain }
      });
      
      if (error) {
        console.error('Error invocando función Edge:', error);
        return null;
      }
      
      if (!data.success || !data.brand) {
        console.log('❌ La función Edge no devolvió datos válidos');
        return null;
      }
      
      console.log(`✅ Assets de marca obtenidos desde función Edge para: ${domain}`);
      return data.brand;
    } catch (error) {
      console.error('Error obteniendo assets desde función Edge:', error);
      return null;
    }
  }
  
  // Actualizar assets de marca en Supabase
  async updateBrandAssets(brandAsset: BrandAsset): Promise<BrandAsset | null> {
    try {
      console.log(`🔄 Actualizando assets de marca para: ${brandAsset.domain}`);
      
      const { data, error } = await supabase
        .from('brand_assets')
        .upsert(brandAsset)
        .select()
        .single();
      
      if (error) {
        console.error('Error actualizando assets de marca:', error);
        return null;
      }
      
      console.log(`✅ Assets de marca actualizados para: ${brandAsset.domain}`);
      return data;
    } catch (error) {
      console.error('Error actualizando assets de marca:', error);
      return null;
    }
  }
  
  // Obtener colores de marca
  async getBrandColors(domain: string): Promise<any | null> {
    try {
      const brandAsset = await this.getBrandAssets(domain);
      if (!brandAsset || !brandAsset.colors) {
        return {
          primary: '#D4AF37',
          secondary: '#8B4513',
          accent: '#FFC107',
          background: '#1a1a1a',
          text: '#FFFFFF'
        };
      }
      
      return brandAsset.colors;
    } catch (error) {
      console.error('Error obteniendo colores de marca:', error);
      return null;
    }
  }
  
  // Obtener logo de marca
  async getBrandLogo(domain: string): Promise<string | null> {
    try {
      const brandAsset = await this.getBrandAssets(domain);
      if (!brandAsset || !brandAsset.logo_url) {
        return null;
      }
      
      return brandAsset.logo_url;
    } catch (error) {
      console.error('Error obteniendo logo de marca:', error);
      return null;
    }
  }
}

export const brandAssetsService = new BrandAssetsService();