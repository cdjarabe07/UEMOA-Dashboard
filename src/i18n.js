import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  fr: {
    translation: {
      accueil: "Accueil",
      donnees: "Données",
      methodologie: "Méthodologie",
      titre_hero: "Comprendre l'économie pour construire l'avenir.",
    },
  },
  en: {
    translation: {
      accueil: "Home",
      donnees: "Data",
      methodologie: "Methodology",
      titre_hero: "Understanding the economy to build the future.",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export default i18n;