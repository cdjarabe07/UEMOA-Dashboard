// Signaux calculés — règles déterministes appliquées aux données exportées.
// Aucun signal n'est rédigé à la main : chaque entrée découle d'une règle.
//
//   ic_zero   : l'intervalle de confiance à 95 % d'une prévision traverse zéro
//               (le signe de la variation n'est pas établi).
//   variation : la valeur centrale varie de plus de 25 % entre les deux
//               années prévues.
//   sans_prev : un indicateur avec historique n'a pas de prévision exportée
//               (marche aléatoire : le pipeline ne publie pas de valeur).
import { INDICATEURS } from "../data/catalogue.js";
import { fmtIntervalle, fmtVariation } from "./format.js";

export const SEUIL_VARIATION = 0.25;

// Liste structurée des signaux : { regle, indicateur, ...paramètres }.
export function calculerSignaux() {
  const signaux = [];

  for (const ind of INDICATEURS) {
    for (const p of ind.previsions) {
      if (p.borne_basse != null && p.borne_haute != null && p.borne_basse < 0 && p.borne_haute > 0) {
        signaux.push({ regle: "ic_zero", indicateur: ind, annee: p.annee, basse: p.borne_basse, haute: p.borne_haute });
      }
    }
  }

  for (const ind of INDICATEURS) {
    if (ind.previsions.length < 2) continue;
    const [a, b] = ind.previsions;
    if (!a.valeur_prevue) continue;
    const ecart = (b.valeur_prevue - a.valeur_prevue) / a.valeur_prevue;
    if (Math.abs(ecart) > SEUIL_VARIATION) {
      signaux.push({ regle: "variation", indicateur: ind, anneeA: a.annee, anneeB: b.annee, ecart: ecart * 100 });
    }
  }

  for (const ind of INDICATEURS) {
    if (ind.statut === "historique") {
      signaux.push({ regle: "sans_prev", indicateur: ind });
    }
  }

  return signaux;
}

// Texte d'un signal dans la langue active : { titre, detail }.
export function texteSignal(s, t) {
  const nom = t(s.indicateur.libelle);
  if (s.regle === "ic_zero") {
    return {
      titre: t("signal_ic_zero_titre", { nom, annee: s.annee }),
      detail: t("signal_ic_zero_detail", { intervalle: fmtIntervalle(s.basse, s.haute, s.indicateur.unite) }),
    };
  }
  if (s.regle === "variation") {
    return {
      titre: t("signal_variation_titre", { nom, anneeA: s.anneeA, anneeB: s.anneeB }),
      detail: t("signal_variation_detail", { ecart: fmtVariation(s.ecart, "%") }),
    };
  }
  return {
    titre: t("signal_sans_prev_titre", { nom }),
    detail: t("signal_sans_prev_detail"),
  };
}
