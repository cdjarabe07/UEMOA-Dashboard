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
import metaData from "../data/meta.json";

// Pays réellement présents dans comparaison_pays.json (source de vérité).
const PAYS = [...new Set(comparaisonData.map((r) => r.pays))];

// Indicateurs réellement disponibles dans comparaison_pays.json.
const INDICATEURS_COMP = [
  { id: "pib", nom: "PIB", unite: "Mds FCFA" },
  { id: "inflation", nom: "Inflation", unite: "%" },
];

const COLORS = ["#1d4ed8", "#0f766e", "#b45309", "#6b7280", "#7c3aed"];

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
  const [paysActifs, setPaysActifs] = useState([PAYS[0]]);
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

  return (
    <div className="comp-root">
      {/* 1. En-tête de page */}
      <header className="accueil-head">
        <p className="accueil-eyebrow">{t("footer_sources")} : BCEAO · DBnomics</p>
        <h1 className="accueil-title">{t("compar5_titre")}</h1>
        <p className="accueil-desc">{t("compar5_desc")}</p>
        <div className="accueil-meta">
          <span>
            {t("footer_datemaj")} : {DATE_MAJ ? `${DATE_MAJ} UTC` : t("comparer_nd")}
          </span>
          <span>{t("compar5_periode_couverte")} : {PERIODE_GLOBALE}</span>
        </div>
      </header>

      {/* 2. Filtres : pays (multi) / indicateur / année */}
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
              {c.nom} ({c.unite})
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
            {ANNEES_DISPO.map((y) => (
              <option key={y} value={`${y}`}>{y}</option>
            ))}
          </select>
        </div>
      </section>

      {/* 3. Dernières observations / année choisie */}
      <section className="home-section" aria-label={t("compar5_table_titre")}>
        <h2 className="home-section-title">{t("compar5_table_titre")}</h2>
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
                  <td>{r.pays}</td>
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

      {/* 4. Comparaison visuelle (une ligne par pays) */}
      {chartData.length > 1 && (
        <section className="home-section" aria-label={indicateur.nom}>
          <h2 className="home-section-title">
            {indicateur.nom} ({indicateur.unite})
          </h2>
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
                  width={70}
                />
                <Tooltip />
                {paysActifs.map((p, i) => (
                  <Line
                    key={p}
                    type="monotone"
                    dataKey={p}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {paysActifs.map((p, i) => (
                <span key={p}>
                  <i className="key" style={{ background: COLORS[i % COLORS.length] }} /> {p}
                </span>
              ))}
            </div>
            <p className="chart-meta">
              {t("donnees_footer_source")} · {t("donnees3_periode")} : {PERIODE_GLOBALE}
            </p>
          </div>
        </section>
      )}

      {/* 5. Métadonnées */}
      <section className="home-section" aria-label={t("accueil2_src_titre")}>
        <h2 className="home-section-title">{t("accueil2_src_titre")}</h2>
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
            <span>{indicateur.nom}</span>
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
  );
}