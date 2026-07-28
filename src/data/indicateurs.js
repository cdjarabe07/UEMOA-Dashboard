// ⚠️ Données réelles chargées depuis les fichiers JSON exportés de tes CSV.

import inflationData from "./inflation_senegal.json";
import tauxChangeData from "./taux_change_uemoa.json";
import pibData from "./pib_senegal.json";

export const INDICATEURS = [
  {
    id: "inflation",
    nom: "Inflation",
    sousTitre: "Taux d'inflation moyen annuel (IPC), Sénégal",
    unite: "%",
    mae: 1.42,
    ordreSarima: "(1,1,2)",
    prevision: { annee: 2025, valeur: 1.6 },
    historique: inflationData,
  },
  {
    id: "taux_change",
    nom: "Taux de change",
    sousTitre: "FCFA pour 1 dollar US, ensemble UMOA",
    unite: "FCFA",
    mae: 28.45,
    ordreSarima: "(1,0,0)",
    prevision: { annee: 2025, valeur: 606 },
    historique: tauxChangeData,
  },
  {
    id: "pib",
    nom: "PIB nominal",
    sousTitre: "Produit intérieur brut, Sénégal",
    unite: "Mds FCFA",
    mae: 361.61,
    ordreSarima: "(2,1,0)",
    prevision: { annee: 2025, valeur: 20500 },
    historique: pibData,
  },
];