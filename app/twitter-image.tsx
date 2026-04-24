import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "WEEK-CHAIN - Certificados Vacacionales Inteligentes"
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
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #ec4899 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "25px",
            boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)",
          }}
        >
          <span style={{ fontSize: "45px", fontWeight: "bold", color: "white", fontFamily: "system-ui" }}>W</span>
        </div>

        {/* Brand */}
        <span
          style={{
            fontSize: "64px",
            fontWeight: "800",
            color: "white",
            fontFamily: "system-ui",
            letterSpacing: "-2px",
            marginBottom: "15px",
          }}
        >
          WEEK-CHAIN™
        </span>

        {/* Tagline */}
        <span
          style={{
            fontSize: "26px",
            color: "#94a3b8",
            fontFamily: "system-ui",
            marginBottom: "35px",
          }}
        >
          Certificados Vacacionales Inteligentes
        </span>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            padding: "16px 40px",
            background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)",
            borderRadius: "50px",
            boxShadow: "0 10px 30px rgba(6, 182, 212, 0.3)",
          }}
        >
          <span style={{ fontSize: "22px", fontWeight: "600", color: "white", fontFamily: "system-ui" }}>
            Descubre tu próximo destino
          </span>
        </div>
      </div>

      {/* URL */}
      <div style={{ position: "absolute", bottom: "25px" }}>
        <span style={{ fontSize: "16px", color: "#64748b", fontFamily: "system-ui" }}>www.week-chain.com</span>
      </div>
    </div>,
    { ...size },
  )
}
