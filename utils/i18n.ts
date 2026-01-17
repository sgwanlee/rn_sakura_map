import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEn from "./locales/en.json";
import translationKo from "./locales/ko.json";

const resources = {
  ko: { translation: translationKo },
  en: { translation: translationEn },
};

export const initI18n = async (callback?: () => void) => {
  const savedLanguage = Localization.getLocales()[0].languageCode!;

  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: "en-US",
    interpolation: {
      escapeValue: false,
    },
  });

  callback?.();
};

export default i18n;
