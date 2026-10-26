"use client"

import { useEffect, useState } from "react"

const SESSION_KEY = "formed_splash_shown"

export function SplashScreen() {
  // Three phases: 'visible' → 'fading' → 'gone'
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("gone")

  useEffect(() => {
    // Only show once per browser session
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, "1")

    setPhase("visible")

    // Start fade-out after 2s
    const fadeTimer = setTimeout(() => setPhase("fading"), 2000)
    // Fully remove after fade completes (600ms transition)
    const goneTimer = setTimeout(() => setPhase("gone"), 2600)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(goneTimer)
    }
  }, [])

  if (phase === "gone") return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #0f3326 0%, #1F5E4A 55%, #0d2e20 100%)",
        opacity: phase === "fading" ? 0 : 1,
        transition: "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: phase === "fading" ? "none" : "all",
      }}
    >
      {/* Ambient glow behind logo */}
      <div
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,167,44,0.18) 0%, transparent 70%)",
          filter: "blur(32px)",
          animation: "formed-glow-pulse 2s ease-in-out infinite",
        }}
      />

      {/* Logo mark */}
      <div
        style={{
          animation: "formed-pop-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both",
        }}
      >
        {/* Cross icon */}
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", margin: "0 auto" }}
        >
          <rect x="27" y="6" width="10" height="52" rx="5" fill="#D4A72C" />
          <rect x="6" y="22" width="52" height="10" rx="5" fill="#D4A72C" />
          <rect x="27" y="6" width="10" height="52" rx="5" fill="url(#cross-grad)" />
          <rect x="6" y="22" width="52" height="10" rx="5" fill="url(#cross-grad)" />
          <defs>
            <linearGradient id="cross-grad" x1="32" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f0c84a" />
              <stop offset="100%" stopColor="#c49728" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wordmark */}
      <div
        style={{
          marginTop: 20,
          animation: "formed-fade-up 0.5s ease 0.35s both",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            FORMED
          </span>
          {/* Gold dot */}
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#D4A72C",
              display: "inline-block",
              marginBottom: 14,
              flexShrink: 0,
            }}
          />
        </div>
      </div>

      {/* Tagline */}
      <p
        style={{
          marginTop: 8,
          fontSize: 13,
          color: "rgba(255,255,255,0.45)",
          fontWeight: 500,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          animation: "formed-fade-up 0.5s ease 0.6s both",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        Discipleship · Community · Growth
      </p>

      {/* Bottom loader dots */}
      <div
        style={{
          position: "absolute",
          bottom: 56,
          display: "flex",
          gap: 6,
          animation: "formed-fade-up 0.4s ease 0.9s both",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "rgba(212,167,44,0.7)",
              animation: `formed-dot-bounce 0.9s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes formed-pop-in {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes formed-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes formed-glow-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.1); }
        }
        @keyframes formed-dot-bounce {
          0%, 80%, 100% { transform: translateY(0);   opacity: 0.4; }
          40%            { transform: translateY(-7px); opacity: 1;   }
        }
      `}</style>
    </div>
  )
}
