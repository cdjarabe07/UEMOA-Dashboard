import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  fr: {
    translation: {
      accueil: "Accueil",
      donnees: "Données",
      methodologie: "Méthodologie",
      titre_hero: "Comprendre l'économie pour construire l'avenir.",
      sous_titre_hero: "Des données fiables et des prévisions rigoureuses pour suivre l'économie sénégalaise et ouest-africaine — inflation, taux de change, PIB, et plus encore.",
      cta_explorer: "Explorer les données →",
      titre_contenus: "Explorer nos contenus",
      note_contenus: "Ces sections seront activées progressivement, une par une.",
      titre_publications: "Dernières publications",
      titre_newsletter: "Restez informé",
      texte_newsletter: "Abonnez-vous à notre lettre d'information pour recevoir les dernières analyses et publications.",
    },
  },
  en: {
    translation: {
      accueil: "Home",
      donnees: "Data",
      methodologie: "Methodology",
      titre_hero: "Understanding the economy to build the future.",
      sous_titre_hero: "Reliable data and rigorous forecasts to track the Senegalese and West African economy — inflation, exchange rate, GDP, and more.",
      cta_explorer: "Explore the data →",
      titre_contenus: "Explore our content",
      note_contenus: "These sections will be activated progressively, one by one.",
      titre_publications: "Latest publications",
      titre_newsletter: "Stay informed",
      texte_newsletter: "Subscribe to our newsletter to receive the latest analyses and publications.",
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