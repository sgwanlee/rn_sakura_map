import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Colors from "../constants/colors";
import { AppConfig } from "../config/app.config";
import useFeedback from "../hooks/useFeedback";
import { FeedbackType } from "../utils/feedback";

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const { submitFeedback, isSubmitting, canSubmit, cooldownSeconds, error, clearError } =
    useFeedback();

  const [nickname, setNickname] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug");
  const [content, setContent] = useState("");

  const nicknameValid =
    nickname.length >= AppConfig.feedback.nicknameMinLength &&
    nickname.length <= AppConfig.feedback.nicknameMaxLength;
  const contentValid =
    content.length >= AppConfig.feedback.contentMinLength &&
    content.length <= AppConfig.feedback.contentMaxLength;
  const canSubmitForm = nicknameValid && contentValid && canSubmit && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmitForm) return;

    clearError();
    const success = await submitFeedback({
      nickname: nickname.trim(),
      type: feedbackType,
      content: content.trim(),
    });

    if (success) {
      Alert.alert(
        "감사합니다!",
        feedbackType === "bug"
          ? "버그 리포트가 접수되었습니다."
          : "아이디어가 접수되었습니다.",
        [{ text: "확인", onPress: () => navigation.goBack() }]
      );
    } else if (error) {
      Alert.alert("오류", error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>의견 보내기</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Rate Limit Warning */}
          {!canSubmit && (
            <View style={styles.rateLimitBanner}>
              <Ionicons name="time-outline" size={20} color={Colors.warning} />
              <Text style={styles.rateLimitText}>
                잠시 후 다시 시도해주세요 ({cooldownSeconds}초)
              </Text>
            </View>
          )}

          {/* Nickname Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={styles.textInput}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor={Colors.gray400}
              value={nickname}
              onChangeText={setNickname}
              maxLength={AppConfig.feedback.nicknameMaxLength}
              autoCapitalize="none"
            />
            <Text style={styles.charCount}>
              {nickname.length}/{AppConfig.feedback.nicknameMaxLength}
            </Text>
          </View>

          {/* Feedback Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>유형</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  feedbackType === "bug" && styles.typeButtonSelected,
                ]}
                onPress={() => setFeedbackType("bug")}
              >
                <Ionicons
                  name="bug-outline"
                  size={24}
                  color={feedbackType === "bug" ? Colors.white : Colors.textPrimary}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    feedbackType === "bug" && styles.typeButtonTextSelected,
                  ]}
                >
                  버그 제보
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  feedbackType === "idea" && styles.typeButtonSelected,
                ]}
                onPress={() => setFeedbackType("idea")}
              >
                <Ionicons
                  name="bulb-outline"
                  size={24}
                  color={feedbackType === "idea" ? Colors.white : Colors.textPrimary}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    feedbackType === "idea" && styles.typeButtonTextSelected,
                  ]}
                >
                  아이디어
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>내용</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder={
                feedbackType === "bug"
                  ? "어떤 버그를 발견하셨나요? 상세히 설명해주세요."
                  : "어떤 아이디어가 있으신가요? 자세히 알려주세요."
              }
              placeholderTextColor={Colors.gray400}
              value={content}
              onChangeText={setContent}
              maxLength={AppConfig.feedback.contentMaxLength}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {content.length}/{AppConfig.feedback.contentMaxLength} (최소 {AppConfig.feedback.contentMinLength}자)
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.submitButton, !canSubmitForm && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmitForm}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>제출하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 36,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  rateLimitBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warningLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  rateLimitText: {
    fontSize: 14,
    color: Colors.warning,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.gray50,
  },
  textArea: {
    height: 150,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: Colors.gray400,
    textAlign: "right",
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 8,
  },
  typeButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  typeButtonTextSelected: {
    color: Colors.white,
  },
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray400,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});
