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
