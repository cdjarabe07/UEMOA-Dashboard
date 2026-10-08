// Contenus éditoriaux : analyses (Observatoire), dossiers thématiques (séries),
// publications (documents institutionnels réels). Voir README.md.
import publicationsData from "./publications.json";
import { INDICATEURS, ZONES, FAMILLES, getIndicateur, GENERATED_AT } from "../data/portail.js";
import { CRITERES } from "../lib/convergence.js";
import { getProduit } from "../data/fmi.js";

// ---------------------------------------------------------------------------
// Dossiers thématiques : un par famille d'indicateurs, plus la convergence.
// ---------------------------------------------------------------------------

const ID_DOSSIER = {
  production: "croissance",
  prix: "inflation",
  finances_publiques: "finances-publiques",
  echanges: "echanges",
  monnaie: "monnaie",
  change: "change",
};

export const DOSSIERS = [
  ...FAMILLES.map((f) => ({
    id: ID_DOSSIER[f],
    famille: f,
    indicateurs: INDICATEURS.filter((i) => i.famille === f).map((i) => i.id),
    criteres: CRITERES.filter((c) => getIndicateur(c.indicateur)?.famille === f).map((c) => c.id),
  })),
  {
    id: "convergence",
    famille: null,
    indicateurs: CRITERES.map((c) => c.indicateur),
    criteres: CRITERES.map((c) => c.id),
  },
].filter((d) => d.id && d.indicateurs.length > 0);

export const getDossier = (id) => DOSSIERS.find((d) => d.id === id) || null;

// Période couverte par les séries d'un dossier.
export const periodeDossier = (d) => {
  const p = d.indicateurs.map((i) => getIndicateur(i)?.periode).filter(Boolean);
  return p.length ? [Math.min(...p.map((x) => x[0])), Math.max(...p.map((x) => x[1]))] : null;
};

// ---------------------------------------------------------------------------
// Publications : registre de documents réels.
// ---------------------------------------------------------------------------

export const PUBLICATIONS = [...publicationsData].sort((a, b) => (b.mise_en_ligne || "").localeCompare(a.mise_en_ligne || ""));
export const getPublication = (id) => PUBLICATIONS.find((p) => p.id === id) || null;
export const publicationsDuDossier = (id) => PUBLICATIONS.filter((p) => (p.dossiers || []).includes(id));

// ---------------------------------------------------------------------------
// Analyses : un fichier JSON par analyse, chargé sans modification de code.
// ---------------------------------------------------------------------------

const APERCU_BROUILLONS = import.meta.env.VITE_APERCU_BROUILLONS === "1";
const ZONES_IDS = new Set(ZONES.map((z) => z.id));
const TYPES_BLOCS = new Set(["texte", "graphique", "tableau", "prix"]);
const bilingue = (v) => v && typeof v.fr === "string" && v.fr.trim() && typeof v.en === "string";
const dateIso = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** Liste des problèmes d'une analyse (vide si elle est valide). */
export function problemesAnalyse(a) {
  const p = [];
  if (!a.id || !/^[a-z0-9-]+$/.test(a.id)) p.push("id manquant ou invalide");
  if (!["publiee", "brouillon"].includes(a.statut)) p.push("statut : « publiee » ou « brouillon »");
  if (a.statut === "publiee" && !(a.validation?.par && dateIso(a.validation?.le))) p.push("analyse publiée sans validation (par, le)");
  if (!dateIso(a.date_publication)) p.push("date_publication invalide");
  if (!dateIso(a.donnees_au)) p.push("donnees_au invalide");
  if (!getDossier(a.dossier)) p.push(`dossier inconnu : ${a.dossier}`);
  for (const k of ["titre", "resume", "question"]) if (!bilingue(a[k])) p.push(`${k} : texte fr et en requis`);
  if (!Array.isArray(a.auteurs) || !a.auteurs.length) p.push("auteurs manquants");
  for (const i of a.indicateurs || []) if (!getIndicateur(i)) p.push(`indicateur inconnu : ${i}`);
  for (const z of a.zones || []) if (!ZONES_IDS.has(z)) p.push(`zone inconnue : ${z}`);
  if (!Array.isArray(a.blocs) || !a.blocs.length) p.push("aucun bloc");
  (a.blocs || []).forEach((b, n) => {
    if (!TYPES_BLOCS.has(b.type)) p.push(`bloc ${n} : type inconnu`);
    if ((b.type === "graphique" || b.type === "tableau") && !getIndicateur(b.indicateur)) p.push(`bloc ${n} : indicateur inconnu`);
    if ((b.type === "graphique" || b.type === "tableau") && !(b.zones || []).every((z) => ZONES_IDS.has(z))) p.push(`bloc ${n} : zone inconnue`);
    if (b.type === "prix" && !(b.produits || []).every((x) => getProduit(x))) p.push(`bloc ${n} : produit inconnu`);
  });
  if (!Array.isArray(a.sources) || !a.sources.length) p.push("sources manquantes");
  for (const id of a.publications || []) if (!getPublication(id)) p.push(`publication inconnue : ${id}`);
  return p;
}

// Analyses publiées : analyses/*.json. Brouillons : analyses/brouillons/*.json, intégrés
// au site uniquement en mode aperçu (VITE_APERCU_BROUILLONS=1) ; sinon, la branche
// est éliminée à la construction et aucun texte non validé n'est publié.
const fichiers = {
  ...import.meta.glob("./analyses/*.json", { eager: true, import: "default" }),
  ...(import.meta.env.VITE_APERCU_BROUILLONS === "1"
    ? import.meta.glob("./analyses/brouillons/*.json", { eager: true, import: "default" })
    : {}),
};

export const ANALYSES = Object.entries(fichiers)
  .map(([chemin, a]) => {
    const problemes = problemesAnalyse(a);
    if (problemes.length && import.meta.env.DEV) console.warn(`Analyse ignorée (${chemin}) :`, problemes);
    return problemes.length ? null : a;
  })
  .filter((a) => a && (a.statut === "publiee" || APERCU_BROUILLONS))
  .sort((a, b) => b.date_publication.localeCompare(a.date_publication));

export const getAnalyse = (id) => ANALYSES.find((a) => a.id === id) || null;
export const analysesDuDossier = (id) => ANALYSES.filter((a) => a.dossier === id);

// Les données du portail sont-elles plus récentes que celles utilisées par l'analyse ?
export const donneesPlusRecentes = (a) => GENERATED_AT && GENERATED_AT.slice(0, 10) > a.donnees_au;
