export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  galleryImages?: string[];
}

export interface PricingRule {
  zipCode: string;
  surcharge: number;
  shippingEstimate: string;
  notes?: string;
}

export interface PricingResponse {
  productId: string;
  productName: string;
  zipCode: string;
  ruleApplied: boolean;
  basePrice: number;
  surcharge: number;
  calculatedPrice: number;
  shippingEstimate: string;
  notes?: string;
  error?: string;
}

export interface ApiCallLog {
  timestamp: string;
  method: string;
  url: string;
  requestBody?: any;
  responseStatus: number;
  responseBody: any;
}
