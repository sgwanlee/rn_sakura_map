import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRevenueCat } from "../contexts/RevenueCatContext";
import { ENTITLEMENT_ID } from "../constants/subscription";
import Colors from "../constants/colors";
import { AppConfig } from "../config/app.config";

interface PaywallScreenProps {
  showCloseButton?: boolean;
}

export default function PaywallScreen({
  showCloseButton = true,
}: PaywallScreenProps) {
  const navigation = useNavigation();
  const {
    currentOffering,
    isLoading,
    purchasePackage,
    restorePurchases,
    isProMember,
    customerInfo,
  } = useRevenueCat();

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null
  );
  const [isPurchasing, setIsPurchasing] = useState(false);

  const packages = currentOffering?.availablePackages || [];

  // Set default selection to yearly if available
  useState(() => {
    if (packages.length > 0 && !selectedPackageId) {
      const yearlyPackage = packages.find((p) => p.packageType === "ANNUAL");
      setSelectedPackageId(yearlyPackage?.identifier || packages[0].identifier);
    }
  });

  const handlePurchase = async () => {
    const selectedPackage = packages.find(
      (p) => p.identifier === selectedPackageId
    );
    if (!selectedPackage) {
      Alert.alert("오류", "구독 상품을 선택해주세요.");
      return;
    }

    setIsPurchasing(true);
    const success = await purchasePackage(selectedPackage);
    setIsPurchasing(false);

    if (success) {
      Alert.alert("구독 완료", "프리미엄 구독이 활성화되었습니다!", [
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleRestore = async () => {
    setIsPurchasing(true);
    const success = await restorePurchases();
    setIsPurchasing(false);

    if (success) {
      Alert.alert("복원 완료", "구독이 복원되었습니다!", [
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert("복원 실패", "복원할 구독이 없습니다.");
    }
  };

  const formatPrice = (priceString: string, period: string) => {
    if (period === "ANNUAL") {
      return `${priceString}/년`;
    } else if (period === "MONTHLY") {
      return `${priceString}/월`;
    }
    return priceString;
  };

  const getPackageLabel = (packageType: string) => {
    switch (packageType) {
      case "ANNUAL":
        return "연간 구독";
      case "MONTHLY":
        return "월간 구독";
      default:
        return "구독";
    }
  };

  const getSavingsText = (pkgs: typeof packages) => {
    const monthly = pkgs.find((p: any) => p.packageType === "MONTHLY");
    const yearly = pkgs.find((p: any) => p.packageType === "ANNUAL");

    if (monthly && yearly) {
      const monthlyPrice = monthly.product.price;
      const yearlyPrice = yearly.product.price;
      const yearlyMonthlyEquivalent = yearlyPrice / 12;
      const savings = Math.round(
        (1 - yearlyMonthlyEquivalent / monthlyPrice) * 100
      );
      if (savings > 0) {
        return `${savings}% 할인`;
      }
    }
    return null;
  };

  // 활성 구독 정보 가져오기
  const getActiveSubscriptionInfo = () => {
    if (!customerInfo) return null;

    // 디버깅: customerInfo 구조 확인
    console.log(
      "CustomerInfo:",
      JSON.stringify(
        {
          activeSubscriptions: customerInfo.activeSubscriptions,
          allExpirationDates: customerInfo.allExpirationDates,
          entitlements: customerInfo.entitlements,
        },
        null,
        2
      )
    );

    // 먼저 ENTITLEMENT_ID로 시도
    let activeEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

    // 없으면 첫 번째 활성 entitlement 사용
    if (!activeEntitlement) {
      const activeEntitlements = Object.values(
        customerInfo.entitlements.active
      );
      if (activeEntitlements.length > 0) {
        activeEntitlement = activeEntitlements[0];
      }
    }

    // 여전히 없으면 activeSubscriptions에서 가져오기
    if (!activeEntitlement && customerInfo.activeSubscriptions.length > 0) {
      const productId = customerInfo.activeSubscriptions[0];
      // 만료일 정보는 allExpirationDates에서 가져오기
      const expirationDate = customerInfo.allExpirationDates[productId] || null;

      return {
        productIdentifier: productId,
        expirationDate: expirationDate,
        willRenew: true, // activeSubscriptions에 있으면 활성 상태
      };
    }

    if (!activeEntitlement) return null;

    return {
      productIdentifier: activeEntitlement.productIdentifier,
      expirationDate: activeEntitlement.expirationDate,
      willRenew: activeEntitlement.willRenew,
    };
  };

  // packages에서 product title 가져오기 (localization 활용)
  const getSubscriptionTypeName = (productId: string) => {
    const matchingPackage = packages.find(
      (pkg) => pkg.product.identifier === productId
    );
    if (matchingPackage) {
      return matchingPackage.product.title;
    }
    return "프리미엄 멤버십";
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  // 구독 중일 때 보여줄 화면
  if (isProMember) {
    const subscriptionInfo = getActiveSubscriptionInfo();

    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="dark" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon and Feature Text - 구독하지 않았을 때와 동일 */}
          <View style={styles.heroSection}>
            <Image
              source={require("../assets/icon.png")}
              style={styles.heroIcon}
            />
            <Text style={styles.heroText}>모든 학습 컨텐츠 무제한 이용</Text>
          </View>

          {/* 구독중인 상품 표시 */}
          <View style={styles.packagesSection}>
            <View style={[styles.packageCard, styles.packageCardSelected]}>
              <View style={styles.radioOuter}>
                <View style={styles.radioInner} />
              </View>
              <View style={styles.packageInfo}>
                <Text style={styles.packageName}>
                  {subscriptionInfo
                    ? getSubscriptionTypeName(
                        subscriptionInfo.productIdentifier
                      )
                    : "프리미엄 구독"}
                </Text>
                <Text style={styles.subscribedBadgeText}>구독 중</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      {showCloseButton && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon and Feature Text */}
        <View style={styles.heroSection}>
          <Image
            source={require("../assets/icon.png")}
            style={styles.heroIcon}
          />
          <Text style={styles.heroText}>모든 학습 컨텐츠 무제한 이용</Text>
        </View>

        {/* Packages */}
        <View style={styles.packagesSection}>
          {packages.map((pkg) => {
            const isSelected = selectedPackageId === pkg.identifier;
            const isYearly = pkg.packageType === "ANNUAL";
            const savings = isYearly ? getSavingsText(packages) : null;

            return (
              <TouchableOpacity
                key={pkg.identifier}
                style={[
                  styles.packageCard,
                  isSelected && styles.packageCardSelected,
                ]}
                onPress={() => setSelectedPackageId(pkg.identifier)}
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
                      월{" "}
                      {(pkg.product.price / 12).toLocaleString("ko-KR", {
                        style: "currency",
                        currency: pkg.product.currencyCode,
                        maximumFractionDigits: 0,
                      })}
                      으로 계산
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          구독은 확인 시 iTunes 계정으로 청구됩니다. 구독은 현재 기간이 끝나기
          최소 24시간 전에 자동 갱신을 끄지 않으면 자동으로 갱신됩니다. 구매 후
          계정 설정에서 구독을 관리하고 자동 갱신을 끌 수 있습니다.
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
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            (isPurchasing || !selectedPackageId) &&
              styles.purchaseButtonDisabled,
          ]}
          onPress={handlePurchase}
          disabled={isPurchasing || !selectedPackageId}
        >
          {isPurchasing ? (
            <ActivityIndicator color={Colors.textInverse} />
          ) : (
            <Text style={styles.purchaseButtonText}>구독 시작하기</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isPurchasing}
        >
          <Text style={styles.restoreButtonText}>구매 복원</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingTop: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  heroIcon: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 16,
  },
  heroText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  packagesSection: {
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
  bottomSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  purchaseButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  purchaseButtonDisabled: {
    backgroundColor: Colors.gray400,
  },
  purchaseButtonText: {
    color: Colors.textInverse,
    fontSize: 18,
    fontWeight: "bold",
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  restoreButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  // 구독 중 화면 스타일
  subscribedBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.success,
    marginTop: 4,
  },
});
