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
import metriquesData from "./previsions_metriques.json";
import comparaisonData from "./comparaison_pays.json";

const annee = (period) => parseInt(String(period).slice(0, 4), 10);

// Familles de données, dans l'ordre d'affichage. Les libellés sont des clés i18n.
export const FAMILLES = [
  { id: "prix", libelle: "famille_prix" },
  { id: "production", libelle: "famille_production" },
  { id: "monnaie", libelle: "famille_monnaie" },
  { id: "change", libelle: "famille_change" },
];

// Métadonnées des modèles : lues dans previsions_metriques.json, produit par
// observatoire/modeles/prevision.py (aucune métrique recopiée à la main).
const MODELES = Object.fromEntries(
  metriquesData.map((m) => [
    m.indicateur,
    {
      type: m.modele,
      ordre: m.ordre,
      mae: m.mae,
      maeNaif: m.mae_naif,
      horizonValidation: m.horizon_validation,
      nbAnneesValidation: m.nb_annees_validation,
      derniereObservation: m.derniere_observation,
      dateEntrainement: m.date_entrainement,
    },
  ])
);

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

// Période couverte par les prévisions publiées, déduite des données : [première, dernière année prévue].
const ANNEES_PREVUES = previsionsData.map((p) => p.annee);
export const PERIODE_PREVISION = ANNEES_PREVUES.length
  ? [Math.min(...ANNEES_PREVUES), Math.max(...ANNEES_PREVUES)]
  : null;

// Années prévues, dans l'ordre (en-têtes de tableaux).
export const ANNEES_PREVISION = [...new Set(ANNEES_PREVUES)].sort((a, b) => a - b);

// Dernière prévision publiée d'un indicateur (horizon le plus lointain).
export const dernierePrevision = (ind) => (ind.previsions.length ? ind.previsions[ind.previsions.length - 1] : null);

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
