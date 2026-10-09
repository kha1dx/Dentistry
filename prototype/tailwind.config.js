/** @type {import('tailwindcss').Config} */
// color-mix keeps opacity modifiers (bg-surface/90) working with CSS-variable colors
const v = (name) => `color-mix(in srgb, var(--${name}) calc(<alpha-value> * 100%), transparent)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: v("bg"),
        surface: { DEFAULT: v("surface"), 2: v("surface-2"), 3: v("surface-3") },
        line: { DEFAULT: v("border"), strong: v("border-strong") },
        ink: { DEFAULT: v("ink"), 2: v("ink-2"), muted: v("muted") },
        primary: {
          DEFAULT: v("primary"),
          hover: v("primary-hover"),
          ink: v("primary-ink"),
          soft: v("primary-soft"),
          "soft-ink": v("primary-soft-ink"),
        },
        good: { DEFAULT: v("good"), soft: v("good-soft") },
        warn: { DEFAULT: v("warn"), soft: v("warn-soft") },
        bad: { DEFAULT: v("bad"), soft: v("bad-soft") },
        info: { DEFAULT: v("info"), soft: v("info-soft") },
        violet: { DEFAULT: v("violet"), soft: v("violet-soft") },
        side: {
          DEFAULT: v("side"),
          2: v("side-2"),
          ink: v("side-ink"),
          muted: v("side-muted"),
          active: v("side-active"),
        },
        enamel: v("enamel"),
        tint: {
          mint: v("tint-mint"),
          lavender: v("tint-lavender"),
          peach: v("tint-peach"),
          sky: v("tint-sky"),
          lemon: v("tint-lemon"),
          rose: v("tint-rose"),
        },
        rail: {
          DEFAULT: v("rail"),
          ink: v("rail-ink"),
          muted: v("rail-muted"),
          active: v("rail-active"),
          "active-ink": v("rail-active-ink"),
        },
        nav: {
          DEFAULT: v("nav"),
          ink: v("nav-ink"),
          muted: v("nav-muted"),
          hover: v("nav-hover"),
          active: v("nav-active"),
          "active-ink": v("nav-active-ink"),
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
        // IDs and phone numbers use the same friendly face (tabular figures) instead of a code font
        mono: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "var(--shadow)",
        pop: "var(--shadow-lg)",
      },
      borderRadius: {
        lg: "10px",
        xl: "14px",
        "2xl": "22px",
        "3xl": "28px",
      },
      fontSize: {
        "2xs": ["11px", "14px"],
      },
      keyframes: {
        "slide-in": { from: { transform: "translateX(24px)", opacity: "0" }, to: { transform: "none", opacity: "1" } },
        "fade-up": { from: { transform: "translateY(6px)", opacity: "0" }, to: { transform: "none", opacity: "1" } },
        "pop-in": { from: { transform: "scale(.97)", opacity: "0" }, to: { transform: "none", opacity: "1" } },
      },
      animation: {
        "slide-in": "slide-in .22s cubic-bezier(.2,.8,.2,1)",
        "fade-up": "fade-up .25s ease-out",
        "pop-in": "pop-in .18s ease-out",
      },
    },
  },
  plugins: [],
};
