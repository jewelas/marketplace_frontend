module.exports = {
  content: ["./dist/**/*.{html,js}"],
  darkMode: "class",
  theme: {
    screens: {
      sm: "575px",
      md: "768px",
      lg: "1025px",
      xl: "1202px"
    },
    fontFamily: {
      display: ['"CalSans-SemiBold"', "sans-serif"],
      body: ['"DM Sans"', "sans-serif"]
    },
    container: {
      center: true,
      padding: "1rem"
    },
    colors: {
      skeletonlight: "rgba(0, 0, 0, 0.13)",
      skeletondark: "rgba(255, 255, 255, 0.13)",
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      accent: "#8358FF",
      "accent-dark": "#7444FF",
      "accent-light": "#9E7CFF",
      "accent-lighter": "#B9A0FF",
      "light-base": "#F5F8FA",
      green: "#10b981",
      orange: "#FEB240",
      "orange-bright": "#FA6D1E",
      red: "#EF4444",
      blue: "#428AF8",
      jacarta: {
        base: "#5A5D79",
        50: "#F4F4F6",
        100: "#E7E8EC",
        200: "#C4C5CF",
        300: "#A1A2B3",
        400: "#7D7F96",
        500: "#5A5D79",
        600: "#363A5D",
        700: "#131740",
        800: "#101436",
        900: "#0D102D",
        950: "#0A0C2D",
      }
    },
    boxShadow: {
      none: "none",
      sm: "0px 1px 2px 0px rgba(13, 16, 45, 0.1)",
      base: "0px 1px 2px -1px rgba(13, 16, 45, 0.1), 0px 2px 4px 0px rgba(13, 16, 45, 0.1)",
      md: "0px 2px 4px -2px rgba(13, 16, 45, 0.1), 0px 4px 6px -1px rgba(13, 16, 45, 0.1)",
      lg: "0px 4px 6px -4px rgba(13, 16, 45, 0.1), 0px 10px 15px -3px rgba(13, 16, 45, 0.1)",
      xl: "0px 8px 10px -6px rgba(13, 16, 45, 0.1), 0px 20px 25px -5px rgba(13, 16, 45, 0.1)",
      "2xl": "0px 25px 50px -12px rgba(13, 16, 45, 0.1), 0px 12px 24px 0px rgba(13, 16, 45, 0.1)",
      "accent-volume":
        "5px 5px 10px rgba(108, 106, 213, 0.25), inset 2px 2px 6px #A78DF0, inset -5px -5px 10px #6336E4",
      "white-volume": "5px 5px 10px rgba(108, 106, 212, 0.25), inset 2px 2px 6px #EEF1F9, inset -5px -5px 10px #DFE3EF"
    },
    fontSize: {
      xs: ["0.75rem", { lineHeight: "normal" }],
      "2xs": ["0.8125rem", { lineHeight: "normal" }],
      sm: ["0.875rem", { lineHeight: "normal" }],
      base: ["1rem", { lineHeight: "normal" }],
      md: ["1.125rem", { lineHeight: "normal" }],
      lg: ["1.25rem", { lineHeight: "normal" }],
      xl: ["1.5rem", { lineHeight: "normal" }],
      "2xl": ["1.75rem", { lineHeight: "normal" }],
      "3xl": ["2rem", { lineHeight: "normal" }],
      "4xl": ["2.25rem", { lineHeight: "normal" }],
      "5xl": ["2.5rem", { lineHeight: "normal" }],
      "6xl": ["3.5rem", { lineHeight: "normal" }],
      "7xl": ["4.25rem", { lineHeight: "normal" }]
    },
    extend: {
      borderRadius: {
        "2lg": "0.625rem",
        "2.5xl": "1.25rem"
      },
      transitionProperty: {
        height: "height",
        width: "width"
      },
      animation: {
        fly: "fly 6s cubic-bezier(0.75, 0.02, 0.31, 0.87) infinite",
        heartBeat: "heartBeat 1s cubic-bezier(0.75, 0.02, 0.31, 0.87) infinite",
        progress: "progress 5s linear"
      },
      keyframes: {
        fly: {
          "0%, 100%": { transform: "translateY(5%)" },
          "50%": { transform: "translateY(0)" }
        },
        heartBeat: {
          "0%, 40%, 80%, 100%": { transform: "scale(1.1)" },
          "20%, 60%": { transform: "scale(.8)" }
        },
        progress: {
          "0%": { width: "0%" },
          "100%": { width: "100%" }
        }
      }
    },
    customGroups: {
      names: ["dropdown"]
    }
  },
  variants: {
    display: ["children", "children-not"]
  },
  plugins: [require("@tailwindcss/forms"), require("tailwindcss-custom-groups")]
}
