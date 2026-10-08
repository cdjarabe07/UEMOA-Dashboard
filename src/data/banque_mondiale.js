// Population et conditions de vie (Banque mondiale, WDI), écrit par
// previsions-macro-uemoa/export_banque_mondiale.py. Chaque valeur est
// affichée avec son année : les dernières années diffèrent selon l'indicateur.
import bm from "./banque_mondiale.json";

export const BM = bm;
export const INDICATEURS_BM = bm.indicateurs;
export const serieBM = (id, zone) => (bm.series[id]?.[zone] || []).map(([annee, valeur]) => ({ annee, valeur }));
export const derniereBM = (id, zone) => serieBM(id, zone).at(-1) || null;
export const valeurBM = (id, zone, annee) => serieBM(id, zone).find((p) => p.annee === annee)?.valeur ?? null;

/** Population totale des 8 pays pour la dernière année commune (somme calculée). */
export function populationUnion() {
  const zones = Object.keys(bm.series.population || {});
  const annees = zones.map((z) => serieBM("population", z).at(-1)?.annee);
  const annee = Math.min(...annees);
  const total = zones.reduce((s, z) => s + (valeurBM("population", z, annee) || 0), 0);
  return zones.length === 8 ? { annee, total } : null;
}
