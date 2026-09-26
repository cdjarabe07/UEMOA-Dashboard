import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { INDICATEURS } from "../data/indicateurs.js";
import previsionsData from "../data/previsions.json";
import {
  DATE_MAJ,
  fmtV,
  nomIndicateur,
  construireSerie,
  GraphiquePrevision,
  LegendePrevision,
  TamponMAE,
  BandeauPage,
} from "./Visuels";

// Métadonnées statiques des 4 indicateurs additionnels présents dans
// previsions.json mais sans historique exporté dans le frontend.
const META_EXTRA = {
  agriculture: { nom: "PIB — Agriculture", unite: "Mds FCFA" },
  industrie: { nom: "PIB — Industrie", unite: "Mds FCFA" },
  services: { nom: "PIB — Services", unite: "Mds FCFA" },
  masse_monetaire: { nom: "Masse monétaire (M2)", unite: "Mds FCFA" },
};

// Historiques disponibles dans le frontend (séries exportées par le pipeline).
const HISTORIQUE = Object.fromEntries(INDICATEURS.map((i) => [i.id, i.historique]));

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

  // Données du graphique : historique réel (depuis 2000) + prévisions avec IC.
  const historique = HISTORIQUE[option.id] || [];
  const chartData =
    historique.length || previsions.length ? construireSerie(historique, previsions, 2000) : null;

  // Intervalle de confiance traversant zéro (règle existante, non modifiée).
  const icTraverseZero = previsions.some(
    (p) => p.borne_basse != null && p.borne_haute != null && p.borne_basse < 0 && p.borne_haute > 0
  );

  const modele = MODELES[option.id] || null;
  const nom = nomIndicateur(t, option.id);
  const libelles = {
    obs: t("donnees3_legend_obs"),
    prev: t("donnees3_legend_prev"),
    ic: t("prevision_ic"),
  };

  return (
    <div className="page-full">
      <BandeauPage
        eyebrow={`${t("nav_previsions")} · ${PERIODE_PREV}`}
        titre={t("prevsim4_titre")}
        sous={t("prevsim4_desc")}
        meta={[
          `${t("footer_datemaj")} : ${DATE_MAJ ? `${DATE_MAJ} UTC` : t("comparer_nd")}`,
          `${t("footer_sources")} : BCEAO · DBnomics`,
        ]}
      />

      <div className="page page--data">
        {/* 1. Sélection de l'indicateur */}
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
              {nomIndicateur(t, o.id)}
            </button>
          ))}
        </nav>

        {/* 2. Résumé de la prévision */}
        <div className="values-strip" role="group" aria-label={t("prevsim4_titre")}>
          {previsions.length > 0 ? (
            previsions.map((p) => (
              <div key={p.annee} className="value-box value-box--prev">
                <p className="value-label">{nom} · {t("prevision_label")} {p.annee}</p>
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
            <div className="value-box value-box--muted">
              <p className="value-label">{nom} · {t("prevision_label")}</p>
              <p className="value-digit">—</p>
              <p className="value-period">{t("prevision_indisponible")}</p>
            </div>
          )}
        </div>

        {/* 3. Graphique prévisionnel + modèle */}
        {chartData && (
          <section className="entry-body" aria-label={nom}>
            <div className="chart-card">
              <div className="chart-card-head">
                <h3>{nom}</h3>
                <span>{option.unite}</span>
              </div>
              <GraphiquePrevision data={chartData} unite={option.unite} libelles={libelles} height={340} />
              <LegendePrevision libelles={libelles} avecPrevision={previsions.length > 0} />
              <p className="chart-card-foot">
                {historique.length ? t("donnees_footer_source") : t("prevsim4_histo_indispo")} ·{" "}
                {t("prevsim4_periode")} : {PERIODE_PREV}
              </p>
            </div>
            <aside className="entry-aside">
              {modele ? (
                <TamponMAE
                  mae={modele.mae}
                  ordre={modele.ordre}
                  kicker={t("precision_mae")}
                  caption={t("precision_caption")}
                />
              ) : (
                <div className="aside-note">
                  <p className="value-label">{t("prevsim4_modele_titre")}</p>
                  <p>{t("prevsim4_modele_nd")}</p>
                </div>
              )}
              {icTraverseZero && <p className="note-ic">{t("prevsim4_signal_zero")}</p>}
              {previsions.length === 0 && <p className="note-ic">{t("prevision_indisponible")}</p>}
            </aside>
          </section>
        )}

        {/* 4. Tableau des prévisions */}
        <section className="home-section" aria-label={t("prevsim4_table_titre")}>
          <h2 className="section-heading">{t("prevsim4_table_titre")}</h2>
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
                  <tr
                    key={r.id}
                    className={`row-clickable ${r.id === actifId ? "row-selected" : ""}`}
                    onClick={() => setActifId(r.id)}
                  >
                    <td>{nomIndicateur(t, r.id)}</td>
                    <td className="num strong">{r.y26 ? fmtV(r.y26.valeur_prevue, r.unite) : t("comparer_nd")}</td>
                    <td className="num muted">
                      {r.y26 && r.y26.borne_basse != null
                        ? `${fmtV(r.y26.borne_basse, r.unite)} – ${fmtV(r.y26.borne_haute, r.unite)}`
                        : t("comparer_nd")}
                    </td>
                    <td className="num strong">{r.y27 ? fmtV(r.y27.valeur_prevue, r.unite) : t("comparer_nd")}</td>
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

        {/* 5. Modèle et performance */}
        <section className="home-section" aria-label={t("prevsim4_modele_titre")}>
          <h2 className="section-heading">{t("prevsim4_modele_titre")}</h2>
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

        {/* 6. Navigation */}
        <div className="prevsim-links">
          <Link to="/donnees" className="link-more">{t("prevsim4_lien_donnees")}</Link>
          <Link to="/methodologie" className="link-more">{t("prevsim4_lien_metho")}</Link>
        </div>
      </div>
    </div>
  );
}