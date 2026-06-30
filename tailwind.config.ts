import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "formed-green": "#1F5E4A",
        "formed-gold": "#D4A72C",
        "formed-charcoal": "#222222",
        "formed-bg": "#FAFAF8",
        "formed-dark": "#0F1A16",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 16px 0 rgba(31,94,74,0.07)",
        card: "0 4px 24px 0 rgba(31,94,74,0.10)",
        gold: "0 2px 12px 0 rgba(212,167,44,0.18)",
      },
      backgroundImage: {
        "green-gradient": "linear-gradient(135deg, #1F5E4A 0%, #2d7a61 100%)",
        "gold-gradient": "linear-gradient(135deg, #D4A72C 0%, #e8c24a 100%)",
        "dark-gradient": "linear-gradient(135deg, #0F1A16 0%, #1a2e26 100%)",
      },
    },
  },
  plugins: [],
}

export default config
