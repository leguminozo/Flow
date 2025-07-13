// Servicio para manejar conversiones de moneda y formateo de precios chilenos

export class CurrencyService {
  private static readonly CLP_SYMBOL = '$';
  private static readonly LOCALE = 'es-CL';
  private static readonly EXCHANGE_RATE_USD_TO_CLP = 950; // Tasa actualizada USD a CLP

  // Convertir precio de USD a CLP (aproximado)
  static convertUSDToCLP(usdPrice: number): number {
    return Math.round(usdPrice * this.EXCHANGE_RATE_USD_TO_CLP);
  }

  // Formatear precio en pesos chilenos
  static formatCLP(amount: number): string {
    return new Intl.NumberFormat(this.LOCALE, {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Formatear precio simple sin símbolo de moneda
  static formatCLPSimple(amount: number): string {
    // Asegurar que el monto sea un número válido
    const validAmount = Math.max(0, Math.round(amount));
    return `${this.CLP_SYMBOL}${validAmount.toLocaleString(this.LOCALE)}`;
  }

  // Formatear precio con separador de miles más claro
  static formatCLPWithSeparator(amount: number): string {
    const validAmount = Math.max(0, Math.round(amount));
    return `${this.CLP_SYMBOL} ${validAmount.toLocaleString(this.LOCALE)}`;
  }

  // Convertir precio de Shopify (que viene en string) a CLP
  static convertShopifyPriceToCLP(shopifyPrice: string): number {
    const priceInUSD = parseFloat(shopifyPrice);
    if (isNaN(priceInUSD)) return 0;
    
    // Si el precio ya está en CLP (mayor a 100), no convertir
    if (priceInUSD > 100) {
      return Math.round(priceInUSD);
    }
    
    // Si está en USD, convertir a CLP
    return this.convertUSDToCLP(priceInUSD);
  }

  // Convertir cualquier precio a formato chileno estándar
  static normalizeToChileanPrice(price: number | string): number {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 0;
    
    // Si es menor a 100, probablemente está en USD
    if (numPrice < 100) {
      return this.convertUSDToCLP(numPrice);
    }
    
    // Ya está en CLP, solo redondear
    return this.roundToNearestTen(numPrice);
  }

  // Calcular descuento en porcentaje
  static calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
    if (originalPrice <= salePrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  // Formatear rango de precios
  static formatPriceRange(minPrice: number, maxPrice: number): string {
    if (minPrice === maxPrice) {
      return this.formatCLPSimple(minPrice);
    }
    return `${this.formatCLPSimple(minPrice)} - ${this.formatCLPSimple(maxPrice)}`;
  }

  // Validar si un precio está en rango chileno válido
  static isValidCLPPrice(price: number): boolean {
    return price >= 50 && price <= 50000000; // Entre $50 y $50M CLP
  }

  // Redondear precio a múltiplos de 10 (común en Chile)
  static roundToNearestTen(price: number): number {
    if (price <= 0) return 0;
    
    // Para precios menores a 1000, redondear a múltiplos de 10
    if (price < 1000) {
      return Math.round(price / 10) * 10;
    }
    // Para precios mayores, redondear a múltiplos de 100
    if (price < 10000) {
      return Math.round(price / 100) * 100;
    }
    // Para precios entre 10k y 100k, redondear a múltiplos de 500
    if (price < 100000) {
      return Math.round(price / 500) * 500;
    }
    // Para precios muy altos, redondear a múltiplos de 1000
    return Math.round(price / 1000) * 1000;
  }

  // Formatear precio para mostrar en tarjetas de producto
  static formatProductPrice(price: number): string {
    const normalizedPrice = this.normalizeToChileanPrice(price);
    return this.formatCLPSimple(normalizedPrice);
  }

  // Formatear precio con contexto (ej: "desde $X" o "hasta $X")
  static formatPriceWithContext(price: number, context: 'desde' | 'hasta' | 'aprox' = 'desde'): string {
    const formattedPrice = this.formatCLPSimple(price);
    switch (context) {
      case 'desde':
        return `Desde ${formattedPrice}`;
      case 'hasta':
        return `Hasta ${formattedPrice}`;
      case 'aprox':
        return `Aprox. ${formattedPrice}`;
      default:
        return formattedPrice;
    }
  }

  // Formatear precio con descuento
  static formatPriceWithDiscount(originalPrice: number, salePrice: number): {
    original: string;
    sale: string;
    discount: number;
    hasDiscount: boolean;
  } {
    const discount = this.calculateDiscountPercentage(originalPrice, salePrice);
    
    return {
      original: this.formatCLPSimple(originalPrice),
      sale: this.formatCLPSimple(salePrice),
      discount,
      hasDiscount: discount > 0,
    };
  }

  // Formatear precio con separadores de miles más legibles
  static formatCLPReadable(amount: number): string {
    if (amount >= 1000000) {
      const millions = amount / 1000000;
      return `${this.CLP_SYMBOL}${millions.toFixed(millions >= 10 ? 0 : 1)}M`;
    }
    if (amount >= 1000) {
      const thousands = amount / 1000;
      return `${this.CLP_SYMBOL}${thousands.toFixed(thousands >= 10 ? 0 : 1)}K`;
    }
    return this.formatCLPSimple(amount);
  }

  // Obtener símbolo de moneda
  static getCurrencySymbol(): string {
    return this.CLP_SYMBOL;
  }

  // Verificar si un precio necesita conversión
  static needsConversion(price: number): boolean {
    return price < 100; // Probablemente está en USD
  }
}