import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "WEEK-CHAIN - Certificados Vacacionales Inteligentes en México"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)",
          opacity: 0.3,
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          left: "-100px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ec4899 0%, #f97316 100%)",
          opacity: 0.25,
          filter: "blur(80px)",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 60px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #ec4899 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)",
            }}
          >
            <span
              style={{
                fontSize: "50px",
                fontWeight: "bold",
                color: "white",
                fontFamily: "system-ui",
              }}
            >
              W
            </span>
          </div>
        </div>

        {/* Brand name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          <span
            style={{
              fontSize: "72px",
              fontWeight: "800",
              color: "white",
              fontFamily: "system-ui",
              letterSpacing: "-2px",
            }}
          >
            WEEK-CHAIN
          </span>
          <span
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              fontFamily: "system-ui",
              marginTop: "-30px",
            }}
          >
            ™
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "#94a3b8",
            fontFamily: "system-ui",
            marginBottom: "40px",
            textAlign: "center",
          }}
        >
          Certificados Vacacionales Inteligentes
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px 30px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span style={{ fontSize: "32px", fontWeight: "700", color: "#06b6d4", fontFamily: "system-ui" }}>
              15 Años
            </span>
            <span style={{ fontSize: "16px", color: "#64748b", fontFamily: "system-ui" }}>de Derechos</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px 30px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span style={{ fontSize: "32px", fontWeight: "700", color: "#8b5cf6", fontFamily: "system-ui" }}>
              Premium
            </span>
            <span style={{ fontSize: "16px", color: "#64748b", fontFamily: "system-ui" }}>Destinos México</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px 30px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span style={{ fontSize: "32px", fontWeight: "700", color: "#ec4899", fontFamily: "system-ui" }}>100%</span>
            <span style={{ fontSize: "16px", color: "#64748b", fontFamily: "system-ui" }}>Legal y Seguro</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "18px", color: "#64748b", fontFamily: "system-ui" }}>www.week-chain.com</span>
      </div>
    </div>,
    {
      ...size,
    },
  )
}
