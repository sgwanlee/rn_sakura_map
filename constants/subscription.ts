// RevenueCat API Keys
// Loaded from environment variables (set in eas.json or .env)
export const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_RC_IOS || "";
export const REVENUECAT_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_RC_ANDROID || "";

// Entitlement ID - this should match your entitlement identifier in RevenueCat
export const ENTITLEMENT_ID = "Premium";

// Product identifiers (these should match your product IDs in App Store Connect / Google Play Console)
export const PRODUCT_IDS = {
  MONTHLY: "monthly_subscription",
  YEARLY: "yearly_subscription",
};

// Offering identifier (optional, use default if not specified)
export const OFFERING_ID = "default";
