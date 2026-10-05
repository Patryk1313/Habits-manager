// =========================
// TYPOGRAPHY
// =========================

export const typography = {
  // =======================
  // DUŻE LICZBY
  // =======================

  display: {
    fontSize: 42,

    lineHeight: 48,

    fontWeight: "800" as const,

    letterSpacing: -1.2,
  },

  metric: {
    fontSize: 34,

    lineHeight: 40,

    fontWeight: "800" as const,

    letterSpacing: -0.8,
  },

  // =======================
  // NAGŁÓWKI
  // =======================

  title: {
    fontSize: 30,

    lineHeight: 36,

    fontWeight: "800" as const,

    letterSpacing: -0.6,
  },

  sectionTitle: {
    fontSize: 22,

    lineHeight: 28,

    fontWeight: "700" as const,

    letterSpacing: -0.3,
  },

  cardTitle: {
    fontSize: 17,

    lineHeight: 22,

    fontWeight: "700" as const,
  },

  // =======================
  // TEKST
  // =======================

  body: {
    fontSize: 15,

    lineHeight: 21,

    fontWeight: "400" as const,
  },

  bodyMedium: {
    fontSize: 15,

    lineHeight: 21,

    fontWeight: "600" as const,
  },

  secondary: {
    fontSize: 13,

    lineHeight: 18,

    fontWeight: "400" as const,
  },

  // =======================
  // MAŁE ELEMENTY
  // =======================

  caption: {
    fontSize: 11,

    lineHeight: 15,

    fontWeight: "500" as const,
  },

  label: {
    fontSize: 10,

    lineHeight: 14,

    fontWeight: "700" as const,

    letterSpacing: 0.6,
  },
} as const;