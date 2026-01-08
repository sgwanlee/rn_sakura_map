import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/colors";
import { AppConfig, OnboardingStep } from "../config/app.config";
import { useRevenueCat } from "../contexts/RevenueCatContext";
import {
  logOnboardingStepView,
  logOnboardingComplete,
  logPaywallPurchaseStarted,
  logPaywallPurchaseSuccess,
  logPaywallRestoreStarted,
  logPaywallRestoreSuccess,
  logPaywallSkipped,
} from "../utils/analytics";

const { width } = Dimensions.get("window");

interface OnboardingScreenProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  completedAt: string;
}

// Calculate total steps: onboarding steps + paywall (if enabled)
const ONBOARDING_STEPS = AppConfig.onboarding.steps;
const SHOW_PAYWALL =
  AppConfig.features.subscription && AppConfig.onboarding.showPaywallAtEnd;
const TOTAL_STEPS = ONBOARDING_STEPS.length + (SHOW_PAYWALL ? 1 : 0);

export default function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // RevenueCat state
  const {
    currentOffering,
    purchasePackage,
    restorePurchases,
    isLoading: isRevenueCatLoading,
    isProMember,
  } = useRevenueCat();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);

  // Is current step the paywall step?
  const isPaywallStep = SHOW_PAYWALL && currentStep === ONBOARDING_STEPS.length;

  // Log step view event when step changes
  useEffect(() => {
    const stepName = isPaywallStep
      ? "paywall"
      : ONBOARDING_STEPS[currentStep]?.id || `step_${currentStep}`;
    logOnboardingStepView(currentStep, stepName);
  }, [currentStep, isPaywallStep]);

  const handleNext = async () => {
    // Skip paywall if user is already a Pro member
    if (currentStep === ONBOARDING_STEPS.length - 1 && SHOW_PAYWALL && isProMember) {
      logOnboardingComplete(new Date().toISOString());
      onComplete({ completedAt: new Date().toISOString() });
      return;
    }

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      logOnboardingComplete(new Date().toISOString());
      onComplete({ completedAt: new Date().toISOString() });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle purchase
  const handlePurchase = async () => {
    if (!currentOffering?.availablePackages?.length) return;

    const selectedPkg = currentOffering.availablePackages[selectedPackageIndex];
    if (!selectedPkg) return;

    setIsPurchasing(true);
    logPaywallPurchaseStarted(selectedPkg.identifier);

    try {
      const success = await purchasePackage(selectedPkg);
      if (success) {
        logPaywallPurchaseSuccess(selectedPkg.identifier);
        onComplete({ completedAt: new Date().toISOString() });
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert("Purchase Error", "An error occurred during purchase. Please try again.");
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  // Handle restore
  const handleRestore = async () => {
    setIsPurchasing(true);
    logPaywallRestoreStarted();

    try {
      const success = await restorePurchases();
      if (success) {
        logPaywallRestoreSuccess();
        Alert.alert("Restore Complete", "Your purchases have been restored.", [
          {
            text: "OK",
            onPress: () => {
              onComplete({ completedAt: new Date().toISOString() });
            },
          },
        ]);
      } else {
        Alert.alert("Restore Failed", "No purchases found to restore.");
      }
    } catch (error) {
      Alert.alert("Restore Error", "An error occurred while restoring purchases.");
    } finally {
      setIsPurchasing(false);
    }
  };

  // Skip paywall (free version)
  const handleSkipPaywall = () => {
    logPaywallSkipped();
    onComplete({ completedAt: new Date().toISOString() });
  };

  const getPackageLabel = (packageType: string) => {
    switch (packageType) {
      case "ANNUAL":
        return "Annual";
      case "MONTHLY":
        return "Monthly";
      default:
        return "Subscription";
    }
  };

  const formatPrice = (priceString: string, period: string) => {
    if (period === "ANNUAL") {
      return `${priceString}/year`;
    } else if (period === "MONTHLY") {
      return `${priceString}/month`;
    }
    return priceString;
  };

  const getSavingsText = (packages: any[]) => {
    const monthly = packages.find((p) => p.packageType === "MONTHLY");
    const yearly = packages.find((p) => p.packageType === "ANNUAL");

    if (monthly && yearly) {
      const monthlyPrice = monthly.product.price;
      const yearlyPrice = yearly.product.price;
      const yearlyMonthlyEquivalent = yearlyPrice / 12;
      const savings = Math.round(
        (1 - yearlyMonthlyEquivalent / monthlyPrice) * 100
      );
      if (savings > 0) {
        return `Save ${savings}%`;
      }
    }
    return null;
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` },
          ]}
        />
      </View>
    </View>
  );

  // Render onboarding step content
  const renderOnboardingStep = (step: OnboardingStep) => (
    <View style={styles.stepContainer}>
      <View style={styles.imageContainer}>
        <Image source={step.image} style={styles.stepImage} resizeMode="contain" />
      </View>
      <Text style={styles.stepTitle}>{step.title}</Text>
      <Text style={styles.stepDescription}>{step.description}</Text>
    </View>
  );

  // Render paywall step
  const renderPaywallStep = () => {
    const packages = currentOffering?.availablePackages || [];

    return (
      <View style={styles.paywallContainer}>
        {/* Icon and Feature Text */}
        <View style={styles.paywallHeroSection}>
          <Image
            source={require("../assets/icon.png")}
            style={styles.paywallHeroIcon}
          />
          <Text style={styles.paywallHeroText}>
            Unlock Premium Features
          </Text>
        </View>

        {/* Package Selection */}
        {isRevenueCatLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : packages.length > 0 ? (
          <View style={styles.packagesContainer}>
            {packages.map((pkg, index) => {
              const isSelected = selectedPackageIndex === index;
              const isYearly = pkg.packageType === "ANNUAL";
              const savings = isYearly ? getSavingsText(packages) : null;

              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[
                    styles.packageCard,
                    isSelected && styles.packageCardSelected,
                  ]}
                  onPress={() => setSelectedPackageIndex(index)}
                >
                  {savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{savings}</Text>
                    </View>
                  )}
                  <View style={styles.radioOuter}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageName}>
                      {getPackageLabel(pkg.packageType)}
                    </Text>
                    <Text style={styles.packagePrice}>
                      {formatPrice(pkg.product.priceString, pkg.packageType)}
                    </Text>
                    {isYearly && (
                      <Text style={styles.packageSubtext}>
                        {(pkg.product.price / 12).toLocaleString("en-US", {
                          style: "currency",
                          currency: pkg.product.currencyCode,
                          maximumFractionDigits: 0,
                        })}{" "}
                        per month
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noPackagesText}>
            Unable to load subscription options.
          </Text>
        )}

        {/* Terms */}
        <Text style={styles.termsText}>
          Subscription is charged to your iTunes account at confirmation.
          Subscription auto-renews unless canceled at least 24 hours before the
          end of the current period.
        </Text>

        {/* Legal Links */}
        <View style={styles.legalLinks}>
          <TouchableOpacity
            onPress={() => Linking.openURL(AppConfig.legal.eulaUrl)}
          >
            <Text style={styles.legalLinkText}>EULA</Text>
          </TouchableOpacity>
          <Text style={styles.legalDivider}>|</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(AppConfig.legal.privacyPolicyUrl)}
          >
            <Text style={styles.legalLinkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render paywall bottom buttons
  const renderPaywallBottomButton = () => {
    const packages = currentOffering?.availablePackages || [];

    return (
      <View style={styles.paywallBottomContainer}>
        {packages.length > 0 && (
          <TouchableOpacity
            style={[
              styles.purchaseButton,
              isPurchasing && styles.purchaseButtonDisabled,
            ]}
            onPress={handlePurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.purchaseButtonText}>Get Started</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.paywallLinksContainer}>
          <TouchableOpacity onPress={handleRestore} disabled={isPurchasing}>
            <Text style={styles.paywallLinkText}>Restore Purchases</Text>
          </TouchableOpacity>
          <Text style={styles.paywallLinkDivider}>|</Text>
          <TouchableOpacity onPress={handleSkipPaywall}>
            <Text style={styles.paywallLinkText}>Start Free</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCurrentStep = () => {
    if (isPaywallStep) {
      return renderPaywallStep();
    }
    return renderOnboardingStep(ONBOARDING_STEPS[currentStep]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        {currentStep > 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={28} color="#afafaf" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        {renderProgressBar()}
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}
      </ScrollView>

      {/* Bottom Button */}
      <View style={isPaywallStep ? styles.paywallBottomWrapper : styles.bottomContainer}>
        {isPaywallStep ? (
          renderPaywallBottomButton()
        ) : (
          <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
            <Text style={styles.continueButtonText}>
              {currentStep === TOTAL_STEPS - 1 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  progressBackground: {
    height: 12,
    backgroundColor: Colors.gray200,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  // Onboarding Step Styles
  stepContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  imageContainer: {
    width: width - 80,
    height: width - 80,
    marginBottom: 32,
  },
  stepImage: {
    width: "100%",
    height: "100%",
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  // Bottom button
  bottomContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
  },
  // Paywall styles
  paywallContainer: {
    flex: 1,
    paddingTop: 20,
  },
  paywallHeroSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  paywallHeroIcon: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 16,
  },
  paywallHeroText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  packagesContainer: {
    marginBottom: 24,
  },
  packageCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 12,
    position: "relative",
  },
  packageCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + "10",
  },
  savingsBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  savingsText: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: "bold",
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
  },
  packageSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  termsText: {
    fontSize: 12,
    color: Colors.gray400,
    lineHeight: 18,
    textAlign: "center",
  },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  legalLinkText: {
    fontSize: 12,
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  legalDivider: {
    fontSize: 12,
    color: Colors.gray400,
    marginHorizontal: 8,
  },
  noPackagesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    padding: 20,
  },
  paywallBottomWrapper: {
    padding: 20,
    paddingBottom: 20,
  },
  paywallBottomContainer: {
    gap: 12,
  },
  purchaseButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
  },
  paywallLinksContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  paywallLinkText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paywallLinkDivider: {
    fontSize: 14,
    color: Colors.gray300,
  },
});
