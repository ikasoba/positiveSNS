import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

import jaJP from "./ja.json";

const resources = {
  ja:{
    translation:jaJP
  }
}

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    lng: "ja"
  })

export default i18n;