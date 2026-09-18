import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

/**
 * Social share card, generated per page.
 *
 * Links to these pages get shared on WhatsApp and LinkedIn far more than they
 * get clicked from search, and a link with no image is a link nobody opens.
 * Rendered on demand and cached at the edge rather than built 3,112 times.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const title = (searchParams.get("title") ?? "The MHS Network").slice(0, 90);
  const eyebrow = (searchParams.get("eyebrow") ?? "").slice(0, 60);
  const brand = (searchParams.get("brand") ?? "").slice(0, 40);
  const accent = /^#?[0-9a-fA-F]{6}$/.test(searchParams.get("accent") ?? "")
    ? `#${(searchParams.get("accent") ?? "").replace("#", "")}`
    : "#5b8cff";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07080c",
          padding: 72,
          position: "relative",
        }}
      >
        {/* accent wash */}
        <div
          style={{
            position: "absolute",
            top: -260,
            left: -160,
            width: 900,
            height: 900,
            borderRadius: 9999,
            background: accent,
            opacity: 0.28,
            filter: "blur(120px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -320,
            right: -200,
            width: 820,
            height: 820,
            borderRadius: 9999,
            background: "#a855f7",
            opacity: 0.22,
            filter: "blur(130px)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {(brand || "M").charAt(0)}
          </div>
          <div style={{ color: "#a2abbd", fontSize: 28, display: "flex" }}>
            {brand || "The MHS Network"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {eyebrow ? (
            <div
              style={{
                display: "flex",
                color: accent,
                fontSize: 26,
                letterSpacing: 3,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              color: "#f2f4f8",
              fontSize: title.length > 52 ? 62 : 76,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#6f7b90",
            fontSize: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: accent,
            }}
          />
          Request a callback — we reply within the hour
        </div>
      </div>
    ),
    SIZE,
  );
}
