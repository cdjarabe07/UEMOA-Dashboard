import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import comparaisonData from "../data/comparaison_pays.json";
import { COULEURS, COULEURS_PAYS, DATE_MAJ, BandeauPage } from "./Visuels";

// Pays réellement présents dans comparaison_pays.json (source de vérité).
const PAYS = [...new Set(comparaisonData.map((r) => r.pays))];

// Indicateurs réellement disponibles dans comparaison_pays.json.
const INDICATEURS_COMP = [
  { id: "pib", nom: "PIB", unite: "Mds FCFA" },
  { id: "inflation", nom: "Inflation", unite: "%" },
];

// Couleur stable par pays (ordre de comparaison_pays.json).
const couleurPays = (pays) => COULEURS_PAYS[PAYS.indexOf(pays) % COULEURS_PAYS.length];


const fmt0 = (v) => v.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
const fmt1 = (v) => v.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
const anneeDe = (period) => parseInt(period.slice(0, 4), 10);

const seriePour = (pays, indicateur) =>
  comparaisonData
    .filter((r) => r.pays === pays && r.indicateur === indicateur && r.valeur != null)
    .sort((a, b) => a.annee.localeCompare(b.annee));

const derniere = (s) => (s.length ? s[s.length - 1] : null);

const anneesSet = new Set(comparaisonData.map((r) => anneeDe(r.annee)));
const ANNEES_DISPO = [...anneesSet].sort((a, b) => a - b);
const PERIODE_GLOBALE = ANNEES_DISPO.length
  ? `${ANNEES_DISPO[0]}–${ANNEES_DISPO[ANNEES_DISPO.length - 1]}`
  : "";

const ANNEE_DERNIERE = "__derniere__";

export default function CartePays() {
  const { t } = useTranslation();
  const [paysActifs, setPaysActifs] = useState(PAYS);
  const [indicateurId, setIndicateurId] = useState("pib");
  const [anneeSelect, setAnneeSelect] = useState(ANNEE_DERNIERE);

  const indicateur = INDICATEURS_COMP.find((c) => c.id === indicateurId) || INDICATEURS_COMP[0];

  const togglePays = (pays) => {
    if (paysActifs.includes(pays)) {
      if (paysActifs.length > 1) setPaysActifs(paysActifs.filter((x) => x !== pays));
    } else {
      setPaysActifs([...paysActifs, pays]);
    }
  };

  // Lignes du tableau (dernière observation ou année choisie).
  const rows = paysActifs.map((pays) => {
    const pib = seriePour(pays, "pib");
    const infl = seriePour(pays, "inflation");
    let dPib = null;
    let dInfl = null;
    let anneeY = null;
    if (anneeSelect === ANNEE_DERNIERE) {
      dPib = derniere(pib);
      dInfl = derniere(infl);
      anneeY = dPib ? anneeDe(dPib.annee) : dInfl ? anneeDe(dInfl.annee) : null;
    } else {
      const y = parseInt(anneeSelect, 10);
      dPib = pib.find((s) => anneeDe(s.annee) === y) || null;
      dInfl = infl.find((s) => anneeDe(s.annee) === y) || null;
      anneeY = y;
    }
    let varPib = null;
    if (dPib) {
      const idx = pib.findIndex((s) => s.annee === dPib.annee);
      if (idx >= 1 && pib[idx - 1].valeur) {
        varPib = ((dPib.valeur - pib[idx - 1].valeur) / pib[idx - 1].valeur) * 100;
      }
    }
    return { pays, annee: anneeY, dPib, dInfl, varPib };
  });

  // Données du graphique : une ligne par pays, sur les années communes.
  const serpar = paysActifs.map((pays) => ({ pays, serie: seriePour(pays, indicateurId) }));
  const anneeUnion = new Set();
  serpar.forEach(({ serie }) => serie.forEach((s) => anneeUnion.add(anneeDe(s.annee))));
  const annees = [...anneeUnion].sort((a, b) => a - b);
  const chartData = annees.map((an) => {
    const row = { annee: an };
    serpar.forEach(({ pays, serie }) => {
      const it = serie.find((s) => anneeDe(s.annee) === an);
      row[pays] = it ? it.valeur : null;
    });
    return row;
  });

  const fmtInd = (v) => (indicateur.unite === "%" ? `${fmt1(v)} %` : `${fmt0(v)} ${indicateur.unite}`);

  return (
    <div className="page-full">
      <BandeauPage
        eyebrow={`${t("nav_comparaison")} · ${PAYS.length} ${t("compar5_pays_suivis")}`}
        titre={t("compar5_titre")}
        sous={t("compar5_desc")}
        meta={[
          `${t("footer_datemaj")} : ${DATE_MAJ ? `${DATE_MAJ} UTC` : t("comparer_nd")}`,
          `${t("compar5_periode_couverte")} : ${PERIODE_GLOBALE}`,
        ]}
      />

      <div className="page page--data">
        {/* 1. Filtres : pays (multi) / indicateur / année */}
        <section className="comp-toolbar">
          <div className="comp-row">
            <span className="comp-label">{t("accueil2_comp_pays")}</span>
            {PAYS.map((p) => (
              <button
                key={p}
                className="chip"
                data-active={paysActifs.includes(p)}
                aria-pressed={paysActifs.includes(p)}
                onClick={() => togglePays(p)}
              >
                <i className="chip-dot" style={{ background: couleurPays(p) }} />
                {p}
              </button>
            ))}
          </div>
          <div className="comp-row">
            <span className="comp-label">{t("compar5_indicateur")}</span>
            {INDICATEURS_COMP.map((c) => (
              <button
                key={c.id}
                className="chip"
                data-active={c.id === indicateurId}
                aria-pressed={c.id === indicateurId}
                onClick={() => setIndicateurId(c.id)}
              >
                {t(`ind_comp_${c.id}`, { defaultValue: c.nom })} ({c.unite})
              </button>
            ))}
          </div>
          <div className="comp-row">
            <span className="comp-label">{t("donnees3_periode")}</span>
            <select
              className="comp-select"
              value={anneeSelect}
              onChange={(e) => setAnneeSelect(e.target.value)}
            >
              <option value={ANNEE_DERNIERE}>{t("compar5_derniere")}</option>
              {[...ANNEES_DISPO].reverse().map((y) => (
                <option key={y} value={`${y}`}>{y}</option>
              ))}
            </select>
          </div>
        </section>

        {/* 2. Fiches pays (dernière observation ou année choisie) */}
        <div className="country-grid">
          {rows.map((r) => (
            <article key={r.pays} className="country-card" style={{ borderTopColor: couleurPays(r.pays) }}>
              <div className="country-card-head">
                <h3>{r.pays}</h3>
                <span>{r.annee ?? t("comparer_nd")}</span>
              </div>
              <div className="country-card-stats">
                <div>
                  <span className="value-label">{t("comparer_pib")}</span>
                  <b>{r.dPib ? fmt0(r.dPib.valeur) : t("comparer_nd")}</b>
                  <small>Mds FCFA</small>
                </div>
                <div>
                  <span className="value-label">{t("comparer_inflation")}</span>
                  <b>{r.dInfl ? `${fmt1(r.dInfl.valeur)} %` : t("comparer_nd")}</b>
                </div>
                <div>
                  <span className="value-label">{t("compar5_variation")}</span>
                  <b className={r.varPib != null ? (r.varPib >= 0 ? "pos" : "neg") : undefined}>
                    {r.varPib != null ? `${r.varPib >= 0 ? "+" : ""}${fmt1(r.varPib)} %` : t("comparer_nd")}
                  </b>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 3. Comparaison visuelle (une ligne par pays) */}
        {chartData.length > 1 && (
          <section className="chart-card chart-card--full" aria-label={indicateur.nom}>
            <div className="chart-card-head">
              <h3>{t(`ind_comp_${indicateur.id}`, { defaultValue: indicateur.nom })}</h3>
              <span>{indicateur.unite}</span>
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={chartData} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={COULEURS.grid} vertical={false} />
                <XAxis
                  dataKey="annee"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  allowDecimals={false}
                  tickCount={10}
                  tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: COULEURS.muted }}
                  axisLine={{ stroke: "rgba(237,233,223,0.18)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: COULEURS.muted }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                  tickFormatter={fmt0}
                />
                <Tooltip
                  formatter={(v, name) => [fmtInd(v), name]}
                  contentStyle={{
                    background: COULEURS.surface,
                    border: "1px solid rgba(237,233,223,0.2)",
                    borderRadius: 8,
                    fontFamily: "IBM Plex Mono",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: COULEURS.muted }}
                  itemStyle={{ color: COULEURS.cream }}
                  cursor={{ stroke: "rgba(237,233,223,0.25)" }}
                />
                {paysActifs.map((p) => (
                  <Line
                    key={p}
                    type="monotone"
                    dataKey={p}
                    stroke={couleurPays(p)}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div className="chart-legend chart-legend--dark">
              {paysActifs.map((p) => (
                <span key={p}>
                  <i className="key" style={{ background: couleurPays(p) }} /> {p}
                </span>
              ))}
            </div>
            <p className="chart-card-foot">
              {t("donnees_footer_source")} · {t("donnees3_periode")} : {PERIODE_GLOBALE}
            </p>
          </section>
        )}

        {/* 4. Tableau */}
        <section className="home-section" aria-label={t("compar5_table_titre")}>
          <h2 className="section-heading">{t("compar5_table_titre")}</h2>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("accueil2_comp_pays")}</th>
                  <th>{t("donnees3_annee")}</th>
                  <th className="num">{t("comparer_pib")} (Mds FCFA)</th>
                  <th className="num">{t("comparer_inflation")} (%)</th>
                  <th className="num">{t("compar5_variation")} (%)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.pays}>
                    <td>
                      <i className="chip-dot" style={{ background: couleurPays(r.pays) }} /> {r.pays}
                    </td>
                    <td>{r.annee ?? t("comparer_nd")}</td>
                    <td className="num">{r.dPib ? fmt0(r.dPib.valeur) : t("comparer_nd")}</td>
                    <td className="num">{r.dInfl ? fmt1(r.dInfl.valeur) : t("comparer_nd")}</td>
                    <td className="num">{r.varPib != null ? fmt1(r.varPib) : t("comparer_nd")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Métadonnées */}
        <section className="home-section" aria-label={t("accueil2_src_titre")}>
          <h2 className="section-heading">{t("accueil2_src_titre")}</h2>
          <div className="metadata">
            <div className="metadata-row">
              <b>{t("footer_sources")}</b>
              <span>BCEAO · DBnomics</span>
            </div>
            <div className="metadata-row">
              <b>{t("footer_datemaj")}</b>
              <span>{DATE_MAJ ? `${DATE_MAJ} UTC` : t("comparer_nd")}</span>
            </div>
            <div className="metadata-row">
              <b>{t("compar5_periode_couverte")}</b>
              <span>{PERIODE_GLOBALE}</span>
            </div>
            <div className="metadata-row">
              <b>{t("compar5_indicateur")}</b>
              <span>{t(`ind_comp_${indicateur.id}`, { defaultValue: indicateur.nom })}</span>
            </div>
            <div className="metadata-row">
              <b>{t("accueil2_col_unite")}</b>
              <span>{indicateur.unite}</span>
            </div>
          </div>
        </section>

        {/* 6. Navigation */}
        <div className="prevsim-links">
          <Link to="/donnees" className="link-more">{t("prevsim4_lien_donnees")}</Link>
          <Link to="/previsions" className="link-more">{t("compar5_lien_prev")}</Link>
        </div>
      </div>
    </div>
  );
}