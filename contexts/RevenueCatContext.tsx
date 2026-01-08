import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from "react-native-purchases";
import {
  REVENUECAT_API_KEY_IOS,
  REVENUECAT_API_KEY_ANDROID,
  ENTITLEMENT_ID,
} from "../constants/subscription";

interface RevenueCatContextType {
  isProMember: boolean;
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;
  isLoading: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(
  undefined
);

interface RevenueCatProviderProps {
  children: ReactNode;
}

export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  const [isProMember, setIsProMember] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializePurchases();
  }, []);

  const initializePurchases = async () => {
    try {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      const apiKey = Platform.select({
        ios: REVENUECAT_API_KEY_IOS,
        android: REVENUECAT_API_KEY_ANDROID,
        default: REVENUECAT_API_KEY_IOS,
      });

      await Purchases.configure({ apiKey });

      // Get customer info
      const info = await Purchases.getCustomerInfo();
      updateCustomerInfo(info);

      // Get offerings
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setCurrentOffering(offerings.current);
      }

      // Listen for customer info updates
      Purchases.addCustomerInfoUpdateListener((info) => {
        updateCustomerInfo(info);
      });
    } catch (error) {
      console.error("RevenueCat initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomerInfo = (info: CustomerInfo) => {
    setCustomerInfo(info);
    const isPro =
      typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    setIsProMember(isPro);
  };

  const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { customerInfo: newInfo } = await Purchases.purchasePackage(pkg);
      updateCustomerInfo(newInfo);
      return typeof newInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error("Purchase error:", error);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const info = await Purchases.restorePurchases();
      updateCustomerInfo(info);
      return typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    } catch (error) {
      console.error("Restore purchases error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCustomerInfo = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      updateCustomerInfo(info);
    } catch (error) {
      console.error("Refresh customer info error:", error);
    }
  };

  return (
    <RevenueCatContext.Provider
      value={{
        isProMember,
        customerInfo,
        currentOffering,
        isLoading,
        purchasePackage,
        restorePurchases,
        refreshCustomerInfo,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
}

// Default values for when subscription is disabled
const defaultContextValue: RevenueCatContextType = {
  isProMember: false,
  customerInfo: null,
  currentOffering: null,
  isLoading: false,
  purchasePackage: async () => false,
  restorePurchases: async () => false,
  refreshCustomerInfo: async () => {},
};

export function useRevenueCat() {
  const context = useContext(RevenueCatContext);
  // Return default values if not within provider (subscription disabled)
  if (context === undefined) {
    return defaultContextValue;
  }
  return context;
}
