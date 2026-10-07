// Catalogue des indicateurs — source centrale des MÉTADONNÉES.
//
// Le catalogue décrit les séries disponibles ; il ne contient aucune valeur
// économique. Les valeurs viennent exclusivement des fichiers JSON exportés
// par le pipeline Python (export_dashboard.py), importés ci-dessous.
//
// Ajouter une famille (dette, commerce, réserves…) : une entrée dans FAMILLES.
// Ajouter un indicateur : une entrée dans INDICATEURS, avec son JSON.

import inflationSenegal from "./inflation_senegal.json";
import pibSenegal from "./pib_senegal.json";
import tauxChangeUemoa from "./taux_change_uemoa.json";
import previsionsData from "./previsions.json";
import comparaisonData from "./comparaison_pays.json";

const annee = (period) => parseInt(String(period).slice(0, 4), 10);

// Familles de données, dans l'ordre d'affichage. Les libellés sont des clés i18n.
export const FAMILLES = [
  { id: "prix", libelle: "famille_prix" },
  { id: "production", libelle: "famille_production" },
  { id: "monnaie", libelle: "famille_monnaie" },
  { id: "change", libelle: "famille_change" },
];

// Métadonnées des modèles : reprises telles quelles des résultats du pipeline
// (anciennement dans indicateurs.js). Absentes quand le pipeline ne les exporte pas.
const MODELES = {
  inflation: { type: "SARIMA", ordre: "(1,1,2)", mae: 1.42 },
  pib: { type: "SARIMA", ordre: "(2,1,0)", mae: 361.61 },
  taux_change: { type: "SARIMA", ordre: "(1,0,0)", mae: 28.45 },
};

const previsionsPour = (id) =>
  previsionsData.filter((p) => p.indicateur === id).sort((a, b) => a.annee - b.annee);

// id = identifiant utilisé par previsions.json. `libelle` / `description` = clés i18n.
const DEFINITIONS = [
  { id: "inflation", famille: "prix", unite: "%", zone: "senegal", historique: inflationSenegal },
  { id: "pib", famille: "production", unite: "Mds FCFA", zone: "senegal", historique: pibSenegal },
  { id: "agriculture", famille: "production", unite: "Mds FCFA", zone: "senegal", historique: [] },
  { id: "industrie", famille: "production", unite: "Mds FCFA", zone: "senegal", historique: [] },
  { id: "services", famille: "production", unite: "Mds FCFA", zone: "senegal", historique: [] },
  { id: "masse_monetaire", famille: "monnaie", unite: "Mds FCFA", zone: "senegal", historique: [] },
  { id: "taux_change", famille: "change", unite: "FCFA", zone: "umoa", historique: tauxChangeUemoa },
];

export const INDICATEURS = DEFINITIONS.map((d) => {
  const previsions = previsionsPour(d.id);
  const anneesHisto = d.historique.map((o) => annee(o.period));
  const anneesPrev = previsions.map((p) => p.annee);
  const aHistorique = d.historique.length > 0;
  const aPrevision = previsions.length > 0;
  return {
    ...d,
    libelle: `ind_${d.id}`,
    description: `ind_${d.id}_desc`,
    frequence: "annuelle",
    sources: ["BCEAO", "DBnomics"],
    previsions,
    modele: MODELES[d.id] || null,
    // "historique_prevision" | "historique" | "prevision_seule"
    statut: aHistorique && aPrevision ? "historique_prevision" : aHistorique ? "historique" : "prevision_seule",
    periodeHistorique: aHistorique ? [Math.min(...anneesHisto), Math.max(...anneesHisto)] : null,
    periodePrevision: aPrevision ? [Math.min(...anneesPrev), Math.max(...anneesPrev)] : null,
  };
});

export const getIndicateur = (id) => INDICATEURS.find((i) => i.id === id) || null;

// Familles réellement alimentées, avec leurs indicateurs (familles vides masquées).
export const famillesDisponibles = () =>
  FAMILLES.map((f) => ({ ...f, indicateurs: INDICATEURS.filter((i) => i.famille === f.id) })).filter(
    (f) => f.indicateurs.length > 0
  );

// Dernière observation et prévision pour une année donnée.
export const derniereObservation = (ind) =>
  ind.historique.length
    ? { annee: annee(ind.historique[ind.historique.length - 1].period), valeur: ind.historique[ind.historique.length - 1].value }
    : null;

export const observationPrecedente = (ind) =>
  ind.historique.length > 1
    ? { annee: annee(ind.historique[ind.historique.length - 2].period), valeur: ind.historique[ind.historique.length - 2].value }
    : null;

export const previsionPour = (ind, an) => ind.previsions.find((p) => p.annee === an) || null;

// ---------------------------------------------------------------------------
// Comparaison entre pays (comparaison_pays.json)
// ---------------------------------------------------------------------------

export const COMPARAISON = {
  pays: [...new Set(comparaisonData.map((r) => r.pays))],
  indicateurs: [
    { id: "pib", libelle: "ind_comp_pib", unite: "Mds FCFA" },
    { id: "inflation", libelle: "ind_comp_inflation", unite: "%" },
  ],
  sources: ["BCEAO", "DBnomics"],
};

// Série annuelle d'un pays pour un indicateur de comparaison (valeurs non nulles).
export const serieComparaison = (pays, indicateur) =>
  comparaisonData
    .filter((r) => r.pays === pays && r.indicateur === indicateur && r.valeur != null)
    .map((r) => ({ annee: annee(r.annee), valeur: r.valeur }))
    .sort((a, b) => a.annee - b.annee);

// Variation du PIB nominal (%) entre deux années consécutives d'une série.
// Il s'agit d'une variation NOMINALE, pas d'une croissance réelle.
export const variationNominale = (serie, an) => {
  const i = serie.findIndex((s) => s.annee === an);
  if (i < 1 || !serie[i - 1].valeur) return null;
  return ((serie[i].valeur - serie[i - 1].valeur) / serie[i - 1].valeur) * 100;
};
