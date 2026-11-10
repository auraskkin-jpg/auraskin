export type SkincareConcern = 
  | 'All' 
  | 'Glass Barrier' 
  | 'Cellular Renewal' 
  | 'Melanin Reset' 
  | 'Dew Infusion' 
  | 'Pore Refinement';

export type FormulationType = 
  | 'Bio-Ferment Essence' 
  | 'Cellular Ampoule' 
  | 'Lipid Barrier Cream' 
  | 'Enzyme Purifier' 
  | 'Photo-Shield Serum';

export interface Product {
  id: string;
  name: string;
  koreanName: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  category: 'Cleanser' | 'Essence' | 'Ampoule' | 'Moisturizer' | 'Treatment' | 'Sunscreen';
  concern: SkincareConcern;
  formulationType: FormulationType;
  volume: string;
  rating: number;
  reviewsCount: number;
  isBestseller?: boolean;
  isNew?: boolean;
  certification: string; // e.g. "Seoul Derma Institute • 98.4% Glass Score"
  image: string;
  texture: string; // e.g. "Silken dew drop with fast-absorbing micro-emulsion"
  description: string;
  benefits: string[];
  keyActives: {
    name: string;
    concentration: string;
    role: string;
  }[];
  clinicalTrialResults: {
    percentage: number;
    claim: string;
    timeframe: string;
  }[];
  usageRitual: {
    am: string;
    pm: string;
    orderNumber: number;
  };
  inciList: string[];
}

export interface Ingredient {
  id: string;
  name: string;
  koreanName: string;
  scientificName: string;
  category: 'Ferments' | 'Peptides' | 'Botanicals' | 'Bio-Lipids';
  description: string;
  extractionMethod: string;
  ewgGrade: number;
  molecularWeight: string;
  skinTargetLayer: 'Stratum Corneum' | 'Epidermis' | 'Dermis';
  benefitMeters: {
    hydration: number; // 0 - 100
    cellularRenewal: number;
    barrierIntegrity: number;
    radiance: number;
  };
  heroFeature: string;
  image: string;
  matchedProductIds: string[];
}

export interface RitualStep {
  stepNumber: number;
  title: string;
  koreanTitle: string;
  period: 'AM' | 'PM' | 'BOTH';
  category: Product['category'];
  defaultProductId: string;
  description: string;
  applicationTip: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

export interface DiagnosticAnswers {
  skinType: 'dry' | 'combination' | 'oily' | 'sensitive';
  primaryConcern: 'dehydration' | 'hyperpigmentation' | 'barrier_damage' | 'texture_pores' | 'loss_of_radiance';
  climateExposure: 'indoor_ac' | 'urban_pollution' | 'high_humidity' | 'arid_sun';
  sensoryPreference: 'weightless_water' | 'rich_cashmere' | 'layered_honey_glow';
}

export interface DiagnosticResult {
  barrierHealthScore: number;
  glassTranslucencyIndex: number;
  recommendedProductIds: string[];
  prescribedRitual: {
    am: string[];
    pm: string[];
  };
  clinicalRationale: string;
  expectedMilestones: {
    day7: string;
    day14: string;
    day28: string;
  };
}
