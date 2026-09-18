export type Pattern = "service_city" | "service_niche_city";

export interface Faq {
  q: string;
  a: string;
}

export interface Service {
  slug: string;
  name: string;
  short: string;
  hero: string;
  intro: string;
  includes: string[];
  why: string;
  from: string;
  faqs: Faq[];
}

export interface City {
  slug: string;
  name: string;
  region: string;
  tier: string;
  known_for: string;
  note?: string;
}

export interface Niche {
  slug: string;
  name: string;
  line: string;
}

export interface Brand {
  key: string;
  name: string;
  domain: string;
  phone: string;
  accent: string;
  central: boolean;
  tagline: string;
  pattern: Pattern;
  services: Service[];
  cities: City[];
  niches: Niche[];
}

export interface Network {
  network_name: string;
  ga4_id: string;
  brands: Brand[];
}

/** One generated page: a service x (niche) x city combination. */
export interface PageCombo {
  brand: Brand;
  service: Service;
  city: City;
  niche: Niche | null;
  slug: string;
}

export interface Lead {
  id: number;
  brand: string;
  service: string;
  city: string;
  source_url: string | null;
  name: string;
  phone: string;
  message: string | null;
  status: string;
  created_at: string;
}
