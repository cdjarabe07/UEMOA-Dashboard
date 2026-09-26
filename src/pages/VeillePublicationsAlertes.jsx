import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import previsionsData from "../data/previsions.json";
import comparaisonData from "../data/comparaison_pays.json";
import metaData from "../data/meta.json";
import { INDICATEURS } from "../data/indicateurs.js";

// Noms d'affichage des indicateurs (métadonnées statiques).
const NOMS = {
  inflation: "Inflation",
  pib: "PIB",
  agriculture: "PIB — Agriculture",
  industrie: "PIB — Industrie",
  services: "PIB — Services",
  masse_monetaire: "Masse monétaire (M2)",
  taux_change: "Taux de change",
};

// Libellé traduit (clé i18n "ind_<id>"), repli sur le nom statique.
const libelle = (t, id) => t(`ind_${id}`, { defaultValue: NOMS[id] || id });

const fmt = (v) => v.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

// ---------------------------------------------------------------------------
// ALERTES CALCULÉES — règles déterministes, basées uniquement sur les données
// exportées par le pipeline (previsions.json, indicateurs.js).
//
//   Règle 1 : l'intervalle de confiance traverse zéro.
//             Le signe de la variation prévue n'est donc pas établi.
//             (Pur fait de données : aucune borne inventée.)
//   Règle 2 : variation marquée de la valeur centrale 2026 → 2027.
//             Règle documentée : |écart relatif| > 25 %.
//   Règle 3 : indicateur suivi sans prévision exportée (marche aléatoire).
// ---------------------------------------------------------------------------

export function construireAlertes(t) {
  const alertes = [];

  // Règle 1 — intervalle de confiance qui traverse zéro.
  for (const p of previsionsData) {
    if (p.borne_basse != null && p.borne_haute != null && p.borne_basse < 0 && p.borne_haute > 0) {
      alertes.push({
        type: "alerte",
        categorie: t("veille_type_alerte"),
        titre: t("veille_alerte_ic_zero_titre", {
          nom: libelle(t, p.indicateur),
          annee: p.annee,
        }),
        texte: t("veille_alerte_ic_zero_raison", {
          basse: fmt(p.borne_basse),
          haute: fmt(p.borne_haute),
        }),
        date: `${p.annee}`,
      });
    }
  }

  // Règle 2 — variation marquée entre les deux années prévues.
  const parIndicateur = new Map();
  for (const p of previsionsData) {
    if (!parIndicateur.has(p.indicateur)) parIndicateur.set(p.indicateur, []);
    parIndicateur.get(p.indicateur).push(p);
  }
  for (const [ind, liste] of parIndicateur) {
    liste.sort((a, b) => a.annee - b.annee);
    if (liste.length < 2) continue;
    const [a, b] = [liste[0], liste[1]];
    const ecart = (b.valeur_prevue - a.valeur_prevue) / a.valeur_prevue;
    if (Math.abs(ecart) > 0.25) {
      alertes.push({
        type: "alerte",
        categorie: t("veille_type_alerte"),
        titre: t("veille_alerte_variation_titre", {
          nom: libelle(t, ind),
          anneeA: a.annee,
          anneeB: b.annee,
        }),
        texte: t("veille_alerte_variation_raison", { pct: fmt(ecart * 100) }),
        date: `${a.annee}–${b.annee}`,
      });
    }
  }

  // Règle 3 — prévision absente pour un indicateur suivi.
  for (const i of INDICATEURS) {
    if (!i.previsions || i.previsions.length === 0) {
      alertes.push({
        type: "alerte",
        categorie: t("veille_type_alerte"),
        titre: t("veille_alerte_sans_prev_titre", { nom: libelle(t, i.id) }),
        texte: t("veille_alerte_sans_prev_raison", { nom: libelle(t, i.id) }),
        date: "2026–2027",
      });
    }
  }

  return alertes;
}

// Dernière année réellement observée dans les données de comparaison.
const DERNIERE_ANNEE = comparaisonData
  .map((r) => parseInt(r.annee.slice(0, 4), 10))
  .reduce((m, a) => Math.max(m, a), 0);

// Date de dernière génération des données (meta.json) — aucune date inventée.
const DATE_MAJ = (() => {
  if (!metaData || typeof metaData.generated_at !== "string") return null;
  const d = new Date(metaData.generated_at);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
})();

export default function VeillePublicationsAlertes() {
  const { t } = useTranslation();
  const [ongletActif, setOngletActif] = useState("toutes");

  const alertes = construireAlertes(t);
  const sources = [
    {
      type: "source",
      categorie: t("veille_type_source"),
      titre: "BCEAO",
      texte: t("veille_source_bceao_texte"),
      date: t("veille_source_derniere_annee", {
        annee: DERNIERE_ANNEE ? DERNIERE_ANNEE : t("comparer_nd"),
      }),
    },
    {
      type: "source",
      categorie: t("veille_type_source"),
      titre: "DBnomics",
      texte: t("veille_source_dbnomics_texte"),
      date: "",
    },
    {
      type: "note",
      categorie: t("veille_type_note"),
      titre: t("veille_note_titre"),
      texte: t("veille_note_texte"),
      date: "",
      lien: "/methodologie",
      lienLabel: t("veille_note_lien"),
    },
  ];

  const items = [...alertes, ...sources];
  const ONGLETS = [
    { id: "toutes", label: t("veille_tab_toutes"), test: () => true },
    { id: "alertes", label: t("veille_tab_alertes"), test: (i) => i.type === "alerte" },
    { id: "sources", label: t("veille_tab_sources"), test: (i) => i.type === "source" || i.type === "note" },
  ];
  const onglet = ONGLETS.find((o) => o.id === ongletActif) || ONGLETS[0];
  const visibles = items.filter(onglet.test);

  return (
    <section className="veille-section">
      <div className="veille-header">
        <div>
          <h2 className="dynamic-section-title">{t("veille_titre")}</h2>
          {DATE_MAJ && (
            <p className="veille-meta">
              {t("veille_date_label")} : {DATE_MAJ} UTC
            </p>
          )}
        </div>
        <Link to="/donnees" className="veille-voir-tout">
          {t("veille_voir_tout")}
        </Link>
      </div>

      <p className="veille-intro">{t("veille_intro")}</p>

      <div className="veille-tabs">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            className={`veille-tab ${ongletActif === o.id ? "active" : ""}`}
            onClick={() => setOngletActif(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div key={ongletActif} className="veille-grid">
        {visibles.map((item, idx) => (
          <article key={idx} className={`veille-card veille-card--${item.type}`}>
            <p className="veille-card-categorie">{item.categorie}</p>
            <h3 className="veille-card-titre">{item.titre}</h3>
            {item.texte && <p className="veille-card-texte">{item.texte}</p>}
            {item.date && <span className="veille-card-date">{item.date}</span>}
            {item.lien && (
              <Link to={item.lien} className="veille-card-lien">
                {item.lienLabel} <ArrowRight size={13} />
              </Link>
            )}
          </article>
        ))}
      </div>

      <p className="veille-disclaimer">{t("veille_disclaimer")}</p>
    </section>
  );
}