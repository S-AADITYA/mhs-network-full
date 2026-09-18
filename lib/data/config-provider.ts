import "server-only";
import type { Brand, Network } from "@/lib/types";
import raw from "@/data/config.json";

interface RawBrand extends Omit<Brand, "niches"> {
  niches?: Brand["niches"];
}

/** Seed content shipped in the repo. Also the source the DB seed script reads. */
export function loadFromConfig(): Network {
  const cfg = raw as unknown as {
    network_name: string;
    ga4_id?: string;
    brands: RawBrand[];
  };
  return {
    network_name: cfg.network_name,
    ga4_id: cfg.ga4_id ?? "",
    brands: cfg.brands.map((b) => ({ ...b, niches: b.niches ?? [] })) as Brand[],
  };
}
