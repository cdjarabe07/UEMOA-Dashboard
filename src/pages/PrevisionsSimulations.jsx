import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ErrorBar,
} from "recharts";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { INDICATEURS } from "../data/indicateurs.js";
import previsionsData from "../data/previsions.json";
import pibData from "../data/pib_senegal.json";
import inflationData from "../data/inflation_senegal.json";
import metaData from "../data/meta.json";

// Métadonnées statiques des 4 indicateurs additionnels présents dans
// previsions.json mais sans historique exporté dans le frontend.
const META_EXTRA = {
  agriculture: { nom: "PIB — Agriculture", unite: "Mds FCFA" },
  industrie: { nom: "PIB — Industrie", unite: "Mds FCFA" },
  services: { nom: "PIB — Services", unite: "Mds FCFA" },
  masse_monetaire: { nom: "Masse monétaire (M2)", unite: "Mds FCFA" },
};

// Historiques disponibles dans le frontend (séries exportées par le pipeline).
const HISTORIQUE = { pib: pibData, inflation: inflationData };

// Source de vérité pour les prévisions : previsions.json.
const OPTIONS = [
  ...INDICATEURS.map((i) => ({
    id: i.id,
    nom: i.nom,
    unite: i.unite,
    previsions: i.previsions || [],
  })),
  ...Object.keys(META_EXTRA).map((id) => ({
    id,
    nom: META_EXTRA[id].nom,
    unite: META_EXTRA[id].unite,
    previsions: previsionsData.filter((p) => p.indicateur === id),
  })),
];

const NOM_PAR_ID = Object.fromEntries(OPTIONS.map((o) => [o.id, o.nom]));
const UNITE_PAR_ID = Object.fromEntries(OPTIONS.map((o) => [o.id, o.unite]));

// Informations de modèle réellement fournies par indicateurs.js.
const MODELES = {};
for (const i of INDICATEURS) {
  MODELES[i.id] = { ordre: i.ordreSarima, mae: i.mae };
}

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

const fmt0 = (v) => v.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
const fmt1 = (v) => v.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
const fmtV = (v, unite) => (unite === "%" ? `${fmt1(v)} %` : `${fmt0(v)} ${unite}`);
const anneeDe = (period) => parseInt(period.slice(0, 4), 10);

// Vue d'ensemble : toutes les prévisions (table).
const prevIndics = [...new Set(previsionsData.map((p) => p.indicateur))];
const prevRows = prevIndics.map((id) => {
  const items = previsionsData
    .filter((p) => p.indicateur === id)
    .sort((a, b) => a.annee - b.annee);
  return {
    id,
    nom: NOM_PAR_ID[id] || id,
    unite: UNITE_PAR_ID[id] || "",
    y26: items.find((p) => p.annee === 2026) || null,
    y27: items.find((p) => p.annee === 2027) || null,
  };
});

const prevAnnees = previsionsData.map((p) => p.annee);
const PERIODE_PREV = prevAnnees.length
  ? `${Math.min(...prevAnnees)}–${Math.max(...prevAnnees)}`
  : "";

export default function PrevisionsSimulations() {
  const { t } = useTranslation();
  const [actifId, setActifId] = useState("pib");
  const option = OPTIONS.find((o) => o.id === actifId) || OPTIONS[0];
  const previsions = option.previsions;

  // Données du graphique : historique réel + points de prévision.
  const historique = HISTORIQUE[option.id] || null;
  let chartData = null;
  if (historique && previsions.length > 0) {
    const histo = historique.map(({ period, value }) => ({
      annee: anneeDe(period),
      valeur: value,
    }));
    const dernier = histo[histo.length - 1];
    const prevRows = [
      { annee: dernier.annee, prevValeur: dernier.valeur },
      ...previsions.map((p) => ({
        annee: p.annee,
        prevValeur: p.valeur_prevue,
        icRange:
          p.borne_basse != null && p.borne_haute != null
            ? [p.borne_basse, p.borne_haute]
            : undefined,
      })),
    ];
    chartData = [...histo, ...prevRows];
  }

  // Intervalle de confiance traversant zéro (règle existante, non modifiée).
  const icTraverseZero = previsions.some(
    (p) => p.borne_basse != null && p.borne_haute != null && p.borne_basse < 0 && p.borne_haute > 0
  );

  const modele = MODELES[option.id] || null;

  return (
    <div className="prevsim-root">
      {/* 1. En-tête de page */}
      <header className="accueil-head">
        <p className="accueil-eyebrow">{t("footer_sources")} : BCEAO · DBnomics</p>
        <h1 className="accueil-title">{t("prevsim4_titre")}</h1>
        <p className="accueil-desc">{t("prevsim4_desc")}</p>
        <div className="accueil-meta">
          <span>
            {t("footer_datemaj")} : {DATE_MAJ ? `${DATE_MAJ} UTC` : t("comparer_nd")}
          </span>
          <span>{t("prevsim4_periode")} : {PERIODE_PREV}</span>
        </div>
      </header>

      {/* 2. Sélection de l'indicateur */}
      <nav className="tabs prevsim-tabs" role="tablist" aria-label={t("prevsim_choisir")}>
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            className="tab"
            role="tab"
            aria-selected={o.id === actifId}
            data-active={o.id === actifId}
            onClick={() => setActifId(o.id)}
          >
            {o.nom}
          </button>
        ))}
      </nav>

      {/* 3. Résumé de la prévision */}
      <div className="values-strip" role="group" aria-label={t("prevsim4_titre")}>
        {previsions.length > 0 ? (
          previsions.map((p) => (
            <div key={p.annee} className="value-box">
              <p className="value-label">{t("prevision_label")} {p.annee}</p>
              <p className="value-digit">{fmtV(p.valeur_prevue, option.unite)}</p>
              {p.borne_basse != null && p.borne_haute != null ? (
                <p className="value-period">
                  {t("prevision_ic")} : {fmtV(p.borne_basse, option.unite)} –{" "}
                  {fmtV(p.borne_haute, option.unite)}
                </p>
              ) : (
                <p className="value-period">{t("comparer_nd")}</p>
              )}
            </div>
          ))
        ) : (
          <div className="value-box">
            <p className="value-label">{t("prevision_label")}</p>
            <p className="value-digit">—</p>
            <p className="value-period">{t("prevision_indisponible")}</p>
          </div>
        )}
      </div>

      {/* 4. Graphique prévisionnel */}
      {chartData ? (
        <section className="home-section" aria-label={option.nom}>
          <div className="data-chart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#eef0f2" vertical={false} />
                <XAxis
                  dataKey="annee"
                  stroke="#d1d5db"
                  tick={{ fontFamily: "IBM Plex Mono", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#d1d5db"
                  tick={{ fontFamily: "IBM Plex Mono", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                />
                <Tooltip />
                <Line type="monotone" dataKey="valeur" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="prevValeur" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 4 }}>
                  <ErrorBar dataKey="icRange" width={8} strokeWidth={2} stroke="#a8860d" />
                </Line>
              </LineChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              <span><i className="key key-obs" /> {t("donnees3_legend_obs")}</span>
              <span><i className="key key-prev" /> {t("donnees3_legend_prev")}</span>
            </div>
            <p className="chart-meta">
              {t("donnees_footer_source")} · {t("prevsim4_periode")} : {PERIODE_PREV} ·
              {" "}{t("accueil2_col_unite")} : {option.unite}
            </p>
          </div>
        </section>
      ) : (
        <p className="note-ic">
          {previsions.length > 0 ? t("prevsim4_histo_indispo") : t("prevision_indisponible")}
        </p>
      )}

      {/* 5. Tableau des prévisions */}
      <section className="home-section" aria-label={t("prevsim4_table_titre")}>
        <h2 className="home-section-title">{t("prevsim4_table_titre")}</h2>
        <p className="home-section-desc">{t("prevsim4_table_desc")}</p>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("accueil2_col_ind")}</th>
                <th className="num">2026</th>
                <th className="num">{t("prevision_ic")}</th>
                <th className="num">2027</th>
                <th className="num">{t("prevision_ic")}</th>
                <th className="num">{t("accueil2_col_unite")}</th>
              </tr>
            </thead>
            <tbody>
              {prevRows.map((r) => (
                <tr key={r.id} className={r.id === actifId ? "row-selected" : undefined}>
                  <td>{r.nom}</td>
                  <td className="num">{r.y26 ? fmtV(r.y26.valeur_prevue, r.unite) : t("comparer_nd")}</td>
                  <td className="num muted">
                    {r.y26 && r.y26.borne_basse != null
                      ? `${fmtV(r.y26.borne_basse, r.unite)} – ${fmtV(r.y26.borne_haute, r.unite)}`
                      : t("comparer_nd")}
                  </td>
                  <td className="num">{r.y27 ? fmtV(r.y27.valeur_prevue, r.unite) : t("comparer_nd")}</td>
                  <td className="num muted">
                    {r.y27 && r.y27.borne_basse != null
                      ? `${fmtV(r.y27.borne_basse, r.unite)} – ${fmtV(r.y27.borne_haute, r.unite)}`
                      : t("comparer_nd")}
                  </td>
                  <td className="num">{r.unite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Modèle et performance */}
      <section className="home-section" aria-label={t("prevsim4_modele_titre")}>
        <h2 className="home-section-title">{t("prevsim4_modele_titre")}</h2>
        <div className="metadata">
          <div className="metadata-row">
            <b>{t("prevsim4_modele_nom")}</b>
            <span>{t("prevsim4_modele_sarima")}</span>
          </div>
          <div className="metadata-row">
            <b>{t("prevsim4_modele_ordre")}</b>
            <span>{modele ? modele.ordre : t("comparer_nd")}</span>
          </div>
          <div className="metadata-row">
            <b>{t("prevsim4_modele_mae")}</b>
            <span>{modele ? `${modele.mae} (${t("precision_caption")})` : t("comparer_nd")}</span>
          </div>
        </div>
      </section>

      {/* 7. Signal d'incertitude (règle existante : IC qui traverse zéro) */}
      {icTraverseZero && (
        <p className="note-ic">{t("prevsim4_signal_zero")}</p>
      )}

      {/* 8. Navigation */}
      <div className="prevsim-links">
        <Link to="/donnees" className="link-more">{t("prevsim4_lien_donnees")}</Link>
        <Link to="/methodologie" className="link-more">{t("prevsim4_lien_metho")}</Link>
      </div>
    </div>
  );
}