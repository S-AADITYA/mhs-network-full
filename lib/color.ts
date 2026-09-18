/** Hex -> HSL parts. Falls back to the default blue on anything unparseable. */
function toHsl(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return [222, 100, 68];

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return [0, 0, Math.round(l * 100)];

  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  return [h, Math.round(s * 100), Math.round(l * 100)];
}

/**
 * The brand palette used by the CSS custom properties.
 *
 * Brand accents were picked for a light background, so on the dark theme they
 * are lifted to a readable lightness. The secondary is a hue-rotated partner
 * that drives every gradient, giving each brand its own duotone.
 */
export function brandPalette(accent: string): { accent: string; accent2: string } {
  const [h, s, l] = toHsl(accent);
  const sat = Math.min(96, Math.max(62, s));
  const light = Math.min(72, Math.max(58, l));
  const h2 = (h + 42) % 360;
  return {
    accent: `hsl(${h} ${sat}% ${light}%)`,
    accent2: `hsl(${h2} ${Math.min(92, sat)}% ${Math.min(74, light + 6)}%)`,
  };
}

/** Inline style object applying a brand's palette to a subtree. */
export function brandStyle(accent: string): React.CSSProperties {
  const p = brandPalette(accent);
  return { "--accent": p.accent, "--accent-2": p.accent2 } as React.CSSProperties;
}
