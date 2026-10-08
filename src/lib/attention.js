// Points d'attention de la page d'accueil : règles fixes, publiées dans la
// méthodologie (#attention). Aucune phrase n'est rédigée à la main : chaque point
// découle d'une règle appliquée à la dernière année disponible, et aucune règle
// ne compare des années séparées par une rupture de série.
import { PAYS, valeur, serie, derniereAnnee, evaluable, comparables, anneeRupture } from "../data/portail.js";
import { CRITERES, respecte } from "./convergence.js";

const critere = (id) => CRITERES.find((c) => c.id === id);

export function pointsAttention() {
  const points = [];

  // 1. Dette publique au-dessus du seuil de convergence (année évaluable seulement).
  const anD = derniereAnnee("dette_pib");
  if (evaluable("dette_pib", anD)) {
    const hors = PAYS.map((p) => ({ id: p.id, v: valeur("dette_pib", p.id, anD) }))
      .filter((x) => respecte(critere("dette"), x.v, anD) === false)
      .sort((a, b) => b.v - a.v);
    if (hors.length) points.push({ regle: "dette", indicateur: "dette_pib", annee: anD, pays: hors });
  }

  // 2. Solde budgétaire : pays qui respectent le critère, déficit le plus élevé.
  const anS = derniereAnnee("solde_budgetaire_pib");
  const soldes = PAYS.map((p) => ({ id: p.id, v: valeur("solde_budgetaire_pib", p.id, anS) })).filter((x) => x.v != null);
  if (soldes.length) {
    const conformes = soldes.filter((x) => respecte(critere("solde"), x.v, anS));
    const pire = [...soldes].sort((a, b) => a.v - b.v)[0];
    points.push({ regle: "solde", indicateur: "solde_budgetaire_pib", annee: anS, conformes, total: soldes.length, pire });
  }

  // 3. Plus forte hausse annuelle de l'inflation (si au moins une hausse).
  const anI = derniereAnnee("inflation");
  const hausses = PAYS.map((p) => {
    const v = valeur("inflation", p.id, anI);
    const avant = valeur("inflation", p.id, anI - 1);
    return v != null && avant != null && comparables("inflation", anI - 1, anI) ? { id: p.id, v, avant, d: v - avant } : null;
  }).filter(Boolean);
  const max = hausses.sort((a, b) => b.d - a.d)[0];
  if (max && max.d > 0) points.push({ regle: "inflation", indicateur: "inflation", annee: anI, ...max });

  // 4. Pression fiscale au plus haut de sa série (même périmètre), et seuil de 20 %.
  const anP = derniereAnnee("pression_fiscale");
  const r = anneeRupture("pression_fiscale");
  const records = PAYS.filter((p) => {
    const s = serie("pression_fiscale", p.id).filter((x) => r == null || (x.annee >= r) === (anP >= r));
    const der = s.at(-1);
    return der && der.annee === anP && s.length >= 10 && s.slice(0, -1).every((x) => x.valeur < der.valeur);
  });
  if (records.length) {
    const debut = Math.min(...records.map((p) => serie("pression_fiscale", p.id)[0].annee));
    const aucunAuSeuil = PAYS.every((p) => respecte(critere("pression_fiscale"), valeur("pression_fiscale", p.id, anP), anP) !== true);
    points.push({ regle: "pression", indicateur: "pression_fiscale", annee: anP, pays: records.map((p) => p.id), debut, aucunAuSeuil });
  }

  return points;
}
