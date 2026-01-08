// Color theme for the app
// Main theme color: Purple (#6F1FFC)
// Point/Accent color: Orange (#F35601)

export const Colors = {
  // Primary colors
  primary: "#6F1FFC",
  primaryLight: "#9B5CFF",
  primaryDark: "#5A19CC",

  // Accent/Point colors
  accent: "#F35601",
  accentLight: "#FF7A33",
  accentDark: "#C44500",

  // Success colors (green)
  success: "#58CC02",
  successLight: "#7ED321",
  successDark: "#46A302",

  // Error colors (red)
  error: "#FF4B4B",
  errorLight: "#FF7A7A",
  errorDark: "#CC3C3C",

  // Warning colors (yellow)
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
  gray400: "#AFAFAF",
  gray500: "#6C757D",
  gray600: "#495057",
  gray700: "#3C3C3C",
  gray800: "#212529",
  gray900: "#1A1A1A",

  // Text colors
  textPrimary: "#212529",
  textSecondary: "#6C757D",
  textDisabled: "#AFAFAF",
  textInverse: "#FFFFFF",

  // Background colors
  background: "#FFFFFF",
  backgroundSecondary: "#F8F9FA",
  backgroundTertiary: "#F1F3F5",

  // Border colors
  border: "#E5E5E5",
  borderLight: "#F1F3F5",
  borderDark: "#DEE2E6",

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
