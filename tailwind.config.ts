import type { Config } from "tailwindcss";

// GRADE UP 디자인 토큰 — 명세서 4번 디자인 시스템의 색상 팔레트
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F6F7F5", // 배경
        surface: "#FFFFFF", // 표면(카드)
        ink: "#101913", // 본문 텍스트
        subtext: "#67716A", // 보조 텍스트
        line: "#E4E8E3", // 구분선
        pine: {
          DEFAULT: "#177452", // 프라이머리
          dk: "#0C3B2A", // 다크(사이드바)
          bg: "#E9F4EF", // 연배경
        },
        gold: "#C9972B", // 강조
        amber: "#D98E1B", // 경고(부분충족)
        danger: "#C0442E", // 위험(미충족)
      },
      borderRadius: {
        card: "12px",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
