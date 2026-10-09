// Données internationales du FMI (fmi.json, écrit par
// previsions-macro-uemoa/export_fmi.py) : prix des matières premières (PCPS)
// projections par pays (WEO) et inflation mensuelle (CPI). Jamais mêlées aux séries BCEAO.
import fmi from "./fmi.json";

export const MATIERES = fmi.matieres_premieres;
export const PRODUITS = MATIERES.produits;
export const PROJECTIONS = fmi.projections;
export const GENERATED_AT_FMI = fmi.generated_at;
export const INFLATION_MENSUELLE = fmi.inflation_mensuelle || { pays: {}, dernier_mois: null };

/** Dernier glissement annuel d'un pays, et celui du même mois un an plus tôt. */
export function glissement(zone) {
  const pts = INFLATION_MENSUELLE.pays[zone]?.points || [];
  if (!pts.length) return { mois: null, valeur: null, unAn: null };
  const [mois, valeur] = pts.at(-1);
  const [a, m] = mois.split("-");
  const unAn = pts.find(([x]) => x === `${Number(a) - 1}-${m}`)?.[1] ?? null;
  return { mois, valeur, unAn };
}

export const getProduit = (id) => PRODUITS.find((p) => p.id === id) || null;
export const produitsDuPays = (zone) => PRODUITS.filter((p) => p.zones.includes(zone));

/** Dernier mois, valeur, et variation sur 12 mois (même mois de l'année précédente). */
export function resumePrix(p) {
  const [mois, v] = p.points.at(-1);
  const [a, m] = mois.split("-");
  const ilYaUnAn = p.points.find(([x]) => x === `${Number(a) - 1}-${m}`);
  return { mois, valeur: v, variation12: ilYaUnAn ? ((v - ilYaUnAn[1]) / ilYaUnAn[1]) * 100 : null };
}

export const projection = (indicateur, zone, annee) => {
  const s = PROJECTIONS.series[indicateur]?.[zone] || [];
  const x = s.find(([an]) => an === annee);
  return x ? x[1] : null;
};

export const ANNEES_PROJECTION = Array.from(
  { length: PROJECTIONS.derniere_annee - PROJECTIONS.premiere_annee + 1 },
  (_, i) => PROJECTIONS.premiere_annee + i
);
