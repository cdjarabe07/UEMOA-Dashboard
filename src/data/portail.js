// Catalogue régional — 8 pays de l'UEMOA + agrégat Union.
//
// Les valeurs viennent exclusivement de portail.json, généré par
// previsions-macro-uemoa/export_portail.py (BCEAO via DBnomics).
// Ce module n'ajoute que des métadonnées d'affichage (clés i18n, familles,
// disposition de la carte en tuiles) — aucun chiffre.

import portail from "./portail.json";

export const GENERATED_AT = portail.generated_at;
export const SOURCE = portail.source;

// Disposition de la carte en tuiles (colonne, ligne) : position schématique
// qui respecte le voisinage des pays, pas un tracé géographique.
const TUILES = {
  senegal: [0, 0],
  mali: [1, 0],
  niger: [2, 0],
  guinee_bissau: [0, 1],
  burkina: [1, 1],
  benin: [2, 1],
  cote_ivoire: [1, 2],
  togo: [2, 2],
};

export const ZONES = portail.zones.map((z) => ({ ...z, tuile: TUILES[z.id] || null }));
export const PAYS = ZONES.filter((z) => z.id !== "uemoa");
export const UNION = ZONES.find((z) => z.id === "uemoa");

// Familles, dans l'ordre d'affichage (clés i18n "famille_<id>").
export const FAMILLES = ["production", "prix", "finances_publiques", "echanges", "monnaie", "change"];

export const INDICATEURS = portail.indicateurs.map((i) => ({
  ...i,
  libelle: `rg_${i.id}`,
  court: `rg_${i.id}_court`,
  // Taux de change : publié pour l'Union uniquement.
  parPays: Object.keys(portail.series[i.id] || {}).some((z) => z !== "uemoa"),
}));

export const getIndicateur = (id) => INDICATEURS.find((i) => i.id === id) || null;

// Série annuelle [{annee, valeur}] d'un indicateur pour une zone.
export const serie = (indicateurId, zoneId) =>
  ((portail.series[indicateurId] || {})[zoneId] || []).map(([annee, valeur]) => ({ annee, valeur }));

// Valeur d'une année précise (null si absente — jamais interpolée).
export const valeur = (indicateurId, zoneId, annee) => {
  const point = ((portail.series[indicateurId] || {})[zoneId] || []).find(([a]) => a === annee);
  return point ? point[1] : null;
};

// Dernière année disponible pour un indicateur, toutes zones confondues.
export const derniereAnnee = (indicateurId) => {
  const ind = getIndicateur(indicateurId);
  return ind && ind.periode ? ind.periode[1] : null;
};

// Années couvertes par au moins un pays (pour le sélecteur d'année).
export const anneesDisponibles = (indicateurId) => {
  const annees = new Set();
  for (const [zone, points] of Object.entries(portail.series[indicateurId] || {})) {
    if (zone === "uemoa") continue;
    points.forEach(([a]) => annees.add(a));
  }
  return [...annees].sort((a, b) => a - b);
};

// Familles réellement alimentées, avec leurs indicateurs.
export const famillesDisponibles = () =>
  FAMILLES.map((f) => ({ id: f, indicateurs: INDICATEURS.filter((i) => i.famille === f) })).filter(
    (f) => f.indicateurs.length > 0
  );

// Provenance (miroir de previsions-macro-uemoa/export_portail.py, sans aucune valeur) :
// ratios « % du PIB » recalculés à partir de leur série en niveau à chaque export
// (l'export s'arrête si l'écart médian dépasse SEUIL_ECART_MEDIAN point).
export const RATIOS_CONTROLES = new Set([
  "dette_pib",
  "solde_budgetaire_pib",
  "pression_fiscale",
  "balance_courante_pib",
  "credit_economie_pib",
]);
export const SEUIL_ECART_MEDIAN = 1;

// Zéros de remplissage écartés par l'export (valeur publiée à 0 alors que la
// série en niveau est non nulle) : indicateur -> zones concernées.
export const ZEROS_ECARTES = {
  solde_budgetaire_pib: ["benin", "burkina", "cote_ivoire"],
};

// Code complet de la série source pour une zone (ex. BCEAO/IMECO/KKKFP3054A0FA).
export const codeSerie = (ind, zoneId) => {
  const zone = ZONES.find((z) => z.id === zoneId);
  return zone ? ind.serie_bceao.replace("<zone>", zone.code_bceao) : ind.serie_bceao;
};

// Zones couvertes par un indicateur (8 pays + Union, ou Union seule).
export const zonesDe = (indicateurId) => ZONES.filter((z) => ((portail.series[indicateurId] || {})[z.id] || []).length > 0);

// Ruptures de série déclarées par l'export (export_portail.py, RUPTURES).
// Les valeurs ne sont jamais modifiées : le portail interrompt les tracés,
// ne calcule pas de variation et n'évalue pas de critère à travers une rupture.
export const RUPTURES = portail.ruptures || [];
export const ruptureDe = (indicateurId) => RUPTURES.find((r) => r.indicateurs.includes(indicateurId)) || null;
export const anneeRupture = (indicateurId) => ruptureDe(indicateurId)?.premiere_annee ?? null;

// Deux années sont comparables si elles sont du même côté de la rupture.
export const comparables = (indicateurId, a, b) => {
  const r = anneeRupture(indicateurId);
  return r == null || a >= r === b >= r;
};

// Une année est évaluable (critère, classement) si elle suit la rupture.
export const evaluable = (indicateurId, annee) => {
  const r = anneeRupture(indicateurId);
  return r == null || annee >= r;
};
