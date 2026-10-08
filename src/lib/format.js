// Formatage des nombres, unités et dates selon la langue active (FR / EN).
import i18n from "../i18n";

export const locale = () => (i18n.language && i18n.language.startsWith("en") ? "en-US" : "fr-FR");

// Nombre brut avec séparateurs de milliers de la langue active.
// fixe=true : nombre de décimales constant (alignement en tableau : "58,0 %").
export const fmtNombre = (v, decimales = 0, fixe = false) =>
  v == null || Number.isNaN(v)
    ? "—"
    : v
        .toLocaleString(locale(), { minimumFractionDigits: fixe ? decimales : 0, maximumFractionDigits: decimales })
        .replace(/^-/, "−"); // vrai signe moins typographique

// Libellé d'unité traduit ("Mds FCFA" -> "FCFA bn" en anglais).
export const libelleUnite = (unite) => i18n.t(`unite_${uniteCle(unite)}`, { defaultValue: unite });
const uniteCle = (unite) =>
  ({ "%": "pct", "% du PIB": "pct_pib", "Mds FCFA": "mds_fcfa", FCFA: "fcfa", "FCFA pour 1 USD": "fcfa_usd" }[unite] ||
  unite);

const estPourcentage = (unite) => unite === "%" || unite === "% du PIB";

// Précision par défaut selon l'unité : 1 décimale pour les %, 0 sinon.
const decimalesPour = (unite) => (estPourcentage(unite) ? 1 : 0);

// Espace insécable avant « % » en français (U+00A0 : l'espace fine U+202F est trop étroite en Source Sans 3) : le symbole ne passe jamais seul à la ligne.
const pct = (n) => (locale() === "fr-FR" ? `${n} %` : `${n}%`);

// Valeur + unité : "2,9 %", "62,4 % du PIB", "21 920 Mds FCFA" / "2.9%", "62.4% of GDP".
// court=true : unité abrégée pour tableaux et cartes ("62,4 %", "21 920").
export function fmtValeur(v, unite, decimales = decimalesPour(unite), court = false) {
  if (v == null || Number.isNaN(v)) return "—";
  const n = fmtNombre(v, decimales, estPourcentage(unite));
  if (unite === "%") return pct(n);
  if (unite === "% du PIB") return court ? pct(n) : `${pct(n)} ${i18n.t("unite_du_pib")}`;
  return court ? n : `${n} ${libelleUnite(unite)}`;
}

export const fmtCourt = (v, unite) => fmtValeur(v, unite, decimalesPour(unite), true);

// Variation signée : "+1,7 pt", "−5,1 pt", "+8,8 %".
export function fmtVariation(v, suffixe, decimales = 1) {
  if (v == null || Number.isNaN(v)) return "—";
  const signe = v > 0 ? "+" : v < 0 ? "−" : "";
  const n = fmtNombre(Math.abs(v), decimales, true);
  const sep = suffixe === "%" && locale() === "en-US" ? "" : " ";
  return `${signe}${n}${suffixe ? sep + suffixe : ""}`;
}

// Intervalle "a – b" dans l'unité donnée.
export const fmtIntervalle = (bas, haut, unite) => `${fmtValeur(bas, unite)} – ${fmtValeur(haut, unite)}`;

// Période "1998–2024" (ou une seule année).
export const fmtPeriode = (p) => (!p ? "—" : p[0] === p[1] ? `${p[0]}` : `${p[0]}–${p[1]}`);

// Date courte : "20/09/2026" (FR) / "09/20/2026" (EN).
export const fmtDate = (d) =>
  d ? d.toLocaleDateString(locale(), { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }) : "—";
