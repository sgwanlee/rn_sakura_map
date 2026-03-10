// Sakura theme colors for the app.

export const Colors = {
  // Primary colors
  primary: "#FFB8C6",
  primaryLight: "#FFD8E1",
  primaryDark: "#A84F67",
  primarySoft: "#FFF0F4",

  // Accent/Point colors
  accent: "#FFC94A",
  accentLight: "#FFE08D",
  accentDark: "#C99418",

  // Success colors
  success: "#58CC02",
  successLight: "#7ED321",
  successDark: "#46A302",

  // Error colors
  error: "#FF4B4B",
  errorLight: "#FF7A7A",
  errorDark: "#CC3C3C",

  // Warning colors
  warning: "#FFC800",
  warningLight: "#FFD633",
  warningDark: "#CCA000",

  // Neutral colors
  white: "#FFFFFF",
  black: "#000000",

  // Gray scale
  gray50: "#F8F9FA",
  gray100: "#F1F3F5",
  gray200: "#E5E5E5",
  gray300: "#DEE2E6",
  gray400: "#B0A8AC",
  gray500: "#6C757D",
  gray600: "#495057",
  gray700: "#4C3A42",
  gray800: "#34252B",
  gray900: "#23171C",

  // Text colors
  textPrimary: "#34252B",
  textSecondary: "#7F6B72",
  textDisabled: "#AFAFAF",
  textInverse: "#FFFFFF",

  // Background colors
  background: "#FFFDFE",
  backgroundSecondary: "#F8F5F6",
  backgroundTertiary: "#FFF0F4",

  // Border colors
  border: "#F0DDE3",
  borderLight: "#F8EDF0",
  borderDark: "#E7CDD5",

  // Overlay colors
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
};

// Semantic color aliases
export const ThemeColors = {
  // Buttons
  buttonPrimary: Colors.primary,
  buttonPrimaryPressed: Colors.primaryDark,
  buttonSecondary: Colors.accent,
  buttonSecondaryPressed: Colors.accentDark,
  buttonDisabled: Colors.gray200,

  // Cards
  cardBackground: Colors.white,
  cardBorder: Colors.border,

  // Input fields
  inputBackground: Colors.white,
  inputBorder: Colors.border,
  inputBorderFocused: Colors.primary,
  inputPlaceholder: Colors.gray400,

  // Navigation
  navBackground: Colors.white,
  navBorder: Colors.border,
  tabActive: Colors.primary,
  tabInactive: Colors.gray400,

  // Progress
  progressBackground: Colors.gray200,
  progressFill: Colors.success,

  // Status
  statusSuccess: Colors.success,
  statusError: Colors.error,
  statusWarning: Colors.warning,
  statusInfo: Colors.primary,
};

export default Colors;
