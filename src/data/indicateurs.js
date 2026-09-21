// ⚠️ Données réelles chargées depuis les fichiers JSON exportés du pipeline Python.
// La seule source de vérité pour les prévisions est `previsions.json`
// (généré par export_dashboard.py depuis data/processed/).

import inflationData from "./inflation_senegal.json";
import tauxChangeData from "./taux_change_uemoa.json";
import pibData from "./pib_senegal.json";
import previsionsData from "./previsions.json";

// Prévisions du pipeline pour un indicateur (2026-2027, avec intervalles de confiance).
// Un indicateur sans prévision exportée (ex. taux de change en marche aléatoire)
// reçoit une liste vide : l'affichage le signalera, on n'invente aucune valeur.
const previsionsPour = (id) => previsionsData.filter((p) => p.indicateur === id);

export const INDICATEURS = [
  {
    id: "inflation",
    nom: "Inflation",
    sousTitre: "Taux d'inflation moyen annuel (IPC), Sénégal",
    unite: "%",
    mae: 1.42,
    ordreSarima: "(1,1,2)",
    previsions: previsionsPour("inflation"),
    historique: inflationData,
  },
  {
    id: "taux_change",
    nom: "Taux de change",
    sousTitre: "FCFA pour 1 dollar US, ensemble UMOA",
    unite: "FCFA",
    mae: 28.45,
    ordreSarima: "(1,0,0)",
    previsions: previsionsPour("taux_change"),
    historique: tauxChangeData,
  },
  {
    id: "pib",
    nom: "PIB nominal",
    sousTitre: "Produit intérieur brut, Sénégal",
    unite: "Mds FCFA",
    mae: 361.61,
    ordreSarima: "(2,1,0)",
    previsions: previsionsPour("pib"),
    historique: pibData,
  },
];