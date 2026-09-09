import { ImageResponse } from "next/og";
import { AppConfig } from "@/utils/AppConfig";

export const runtime = "edge";

export const alt = `${AppConfig.name} — comparateur indépendant des experts-comptables en Europe`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #062462 0%, #04173F 100%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          color: "#FFFFFF",
          position: "relative",
        }}
      >
        {/* Decorative radial accent — bottom-right */}
        <div
          style={{
            position: "absolute",
            right: "-160px",
            bottom: "-160px",
            width: "520px",
            height: "520px",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(255,107,53,0.32) 0%, rgba(255,107,53,0) 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "-120px",
            top: "-120px",
            width: "420px",
            height: "420px",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(44,93,184,0.4) 0%, rgba(44,93,184,0) 60%)",
          }}
        />

        {/* Header — Logo lockup */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "22px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "14px",
              background: "#0B3D91",
              border: "2px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: "52px",
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1,
              }}
            >
              S
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "8px",
                right: "8px",
                width: "14px",
                height: "14px",
                borderRadius: "9999px",
                background: "#FF6B35",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "60px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
            }}
          >
            {AppConfig.name}
          </div>
        </div>

        {/* Eyebrow pill */}
        <div
          style={{
            marginTop: "72px",
            alignSelf: "flex-start",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 18px",
            border: "1px solid rgba(255,107,53,0.4)",
            borderRadius: "9999px",
            background: "rgba(255,107,53,0.12)",
            color: "#FFB388",
            fontSize: "18px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "9999px",
              background: "#FF6B35",
            }}
          />
          Comparateur indépendant
        </div>

        {/* Headline — 2 lignes explicites pour éviter le wrap Satori cassé. */}
        <div
          style={{
            marginTop: "36px",
            display: "flex",
            flexDirection: "column",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: "76px",
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
              color: "#FFFFFF",
            }}
          >
            Notez le bon
          </div>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
              color: "#FF6B35",
            }}
          >
            expert-comptable
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: "32px",
            fontSize: "24px",
            lineHeight: 1.4,
            color: "rgba(255,255,255,0.78)",
            maxWidth: "920px",
            zIndex: 1,
          }}
        >
          Comparez les experts-comptables vérifiés en Europe à partir de sources publiques (RNE, registre OEC) et d&apos;une méthode éditoriale indépendante.
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "28px",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.6)",
            fontSize: "20px",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span>100 % gratuit</span>
            <span>·</span>
            <span>Sans engagement</span>
            <span>·</span>
            <span>Sources publiques</span>
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            skoria.fr
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
