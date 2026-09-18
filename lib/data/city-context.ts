import type { City, Service } from "@/lib/types";

/**
 * A locally-varied paragraph built from real city attributes, so no two city
 * pages read identically. Ported verbatim from city_context() in generate.py —
 * the sentence shape is chosen by a stable hash of the city slug, so a given
 * city keeps the same wording across rebuilds.
 */
export function cityContext(service: Service, city: City): string {
  if (city.note) return city.note;

  const kf = city.known_for ?? "";
  const region = city.region ?? "";
  const tier = city.tier ?? "";
  const name = city.name;
  const sname = service.short;

  let sum = 0;
  for (const ch of city.slug) sum += ch.codePointAt(0) ?? 0;
  const shapes = [
    `${name} is ${kf}, and we run ${sname} for brands across ${region} from a team that knows the market here.`,
    `For ${sname} in ${name}, being ${kf} means the audience and the competition are different from anywhere else, and we plan for that.`,
    `We serve ${name}, ${kf}, across ${region}. That local read is what keeps a ${name} campaign from looking generic.`,
    `Brands in ${name} benefit from its position as ${kf}. Our ${sname} is tailored to what actually works in this ${tier} market.`,
  ];
  return shapes[sum % 4];
}
