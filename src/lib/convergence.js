// Critères du Pacte de convergence, de stabilité, de croissance et de
// solidarité de l'UEMOA (Acte additionnel n° 01/2015/CCEG/UEMOA).
//
// Seuls les critères calculables avec les séries exportées sont évalués :
// le critère « masse salariale / recettes fiscales ≤ 35 % » n'est pas couvert.
import { PAYS, UNION, valeur, evaluable } from "../data/portail.js";

export const CRITERES = [
  { id: "solde", indicateur: "solde_budgetaire_pib", rang: 1, sens: ">=", seuil: -3 },
  { id: "inflation", indicateur: "inflation", rang: 1, sens: "<=", seuil: 3 },
  { id: "dette", indicateur: "dette_pib", rang: 1, sens: "<=", seuil: 70 },
  { id: "pression_fiscale", indicateur: "pression_fiscale", rang: 2, sens: ">=", seuil: 20 },
];

// Critère évaluable une année donnée : faux si la série a changé de périmètre
// depuis (ex. dette publique avant 2022, voir RUPTURES dans portail.json).
export const nonComparable = (critere, annee) => annee != null && !evaluable(critere.indicateur, annee);

// true / false, ou null si la valeur manque ou si l'année n'est pas comparable.
export const respecte = (critere, v, annee = null) =>
  v == null || nonComparable(critere, annee) ? null : critere.sens === "<=" ? v <= critere.seuil : v >= critere.seuil;

// Tableau d'évaluation pour une année : une ligne par pays, puis l'Union.
export function evaluerConvergence(annee) {
  return [...PAYS, UNION].map((zone) => {
    const resultats = CRITERES.map((c) => {
      const v = valeur(c.indicateur, zone.id, annee);
      return { critere: c, valeur: v, respecte: respecte(c, v, annee), nonComparable: nonComparable(c, annee) };
    });
    return {
      zone,
      resultats,
      nbRespectes: resultats.filter((r) => r.respecte === true).length,
      nbEvalues: resultats.filter((r) => r.respecte !== null).length,
    };
  });
}
