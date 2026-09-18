import "server-only";
import { cache } from "react";
import type { Brand, Network } from "@/lib/types";
import { loadFromConfig } from "./config-provider";
import { loadFromSupabase, supabaseDataConfigured } from "./supabase-provider";

/**
 * The public site reads its content from Supabase once the project is wired up,
 * and falls back to data/config.json until then. Both return the same shape, so
 * pages never branch on the source.
 */
export const getNetwork = cache(async (): Promise<Network> => {
  if (supabaseDataConfigured()) {
    try {
      return await loadFromSupabase();
    } catch (error) {
      // A DB blip should degrade to the committed content, not a broken site.
      console.error("Supabase content load failed, using config.json:", error);
    }
  }
  return loadFromConfig();
});

export const getBrands = cache(async (): Promise<Brand[]> => {
  return (await getNetwork()).brands;
});

export const getBrand = cache(async (key: string): Promise<Brand | null> => {
  const brands = await getBrands();
  return brands.find((b) => b.key === key) ?? null;
});

/** The other brands in the network, for the cross-brand footer links. */
export async function getSiblingBrands(key: string): Promise<Brand[]> {
  return (await getBrands()).filter((b) => b.key !== key);
}

export { supabaseDataConfigured };
