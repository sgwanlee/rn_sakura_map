import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useUpdate } from "../contexts/UpdateContext";
import { openAppStore } from "./VersionChecker";
import Colors from "../constants/colors";

const UpdateButton = () => {
  const { t } = useTranslation();
  const { updateAvailable, storeVersion } = useUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => openAppStore()}>
        <View style={styles.content}>
          <Ionicons name="cloud-download-outline" size={24} color="#fff" />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{t("settings.update.title")}</Text>
            <Text style={styles.description}>
              {t("settings.update.description", { version: storeVersion })}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2196F3",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginTop: 2,
  },
});

export default UpdateButton;
