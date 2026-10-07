// Critères du Pacte de convergence, de stabilité, de croissance et de
// solidarité de l'UEMOA (Acte additionnel n° 01/2015/CCEG/UEMOA).
//
// Seuls les critères calculables avec les séries exportées sont évalués :
// le critère « masse salariale / recettes fiscales ≤ 35 % » n'est pas couvert.
import { PAYS, UNION, valeur } from "../data/portail.js";

export const CRITERES = [
  { id: "solde", indicateur: "solde_budgetaire_pib", rang: 1, sens: ">=", seuil: -3 },
  { id: "inflation", indicateur: "inflation", rang: 1, sens: "<=", seuil: 3 },
  { id: "dette", indicateur: "dette_pib", rang: 1, sens: "<=", seuil: 70 },
  { id: "pression_fiscale", indicateur: "pression_fiscale", rang: 2, sens: ">=", seuil: 20 },
];

export const respecte = (critere, v) =>
  v == null ? null : critere.sens === "<=" ? v <= critere.seuil : v >= critere.seuil;

// Tableau d'évaluation pour une année : une ligne par pays, puis l'Union.
export function evaluerConvergence(annee) {
  return [...PAYS, UNION].map((zone) => {
    const resultats = CRITERES.map((c) => {
      const v = valeur(c.indicateur, zone.id, annee);
      return { critere: c, valeur: v, respecte: respecte(c, v) };
    });
    return {
      zone,
      resultats,
      nbRespectes: resultats.filter((r) => r.respecte === true).length,
      nbEvalues: resultats.filter((r) => r.respecte !== null).length,
    };
  });
}
