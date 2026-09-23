import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import metaData from "../data/meta.json";
import previsionsData from "../data/previsions.json";
import comparaisonData from "../data/comparaison_pays.json";
import inflationData from "../data/inflation_senegal.json";
import pibData from "../data/pib_senegal.json";
import tauxChangeData from "../data/taux_change_uemoa.json";
import { construireAlertes } from "./VeillePublicationsAlertes";

// Métadonnées d'affichage uniquement (aucune valeur économique ici).
const NOMS = {
  inflation: "Inflation",
  pib: "PIB nominal",
  agriculture: "PIB — Agriculture",
  industrie: "PIB — Industrie",
  services: "PIB — Services",
  masse_monetaire: "Masse monétaire (M2)",
  taux_change: "Taux de change",
};
const UNITES = {
  inflation: "%",
  pib: "Mds FCFA",
  agriculture: "Mds FCFA",
  industrie: "Mds FCFA",
  services: "Mds FCFA",
  masse_monetaire: "Mds FCFA",
  taux_change: "FCFA",
};

const fmt0 = (v) => v.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
const fmt1 = (v) => v.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
const fmtV = (v, unite) => (unite === "%" ? `${fmt1(v)} %` : `${fmt0(v)} ${unite}`);
const anneeDe = (period) => parseInt(period.slice(0, 4), 10);
const dernierObs = (data) => (data.length ? data[data.length - 1] : null);

// Date de dernière génération (meta.json — aucune date inventée).
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

// ---- 2. Indicateurs clés (prévisions 2026 ou dernière observation) ----
const prevPar = (id, annee) =>
  previsionsData.find((p) => p.indicateur === id && p.annee === annee);

const kpis = [
  {
    id: "inflation",
    nom: NOMS.inflation,
    unite: UNITES.inflation,
    valeur: prevPar("inflation", 2026)?.valeur_prevue ?? null,
    type: "prevision",
    annee: 2026,
    obs: dernierObs(inflationData),
  },
  {
    id: "pib",
    nom: NOMS.pib,
    unite: UNITES.pib,
    valeur: prevPar("pib", 2026)?.valeur_prevue ?? null,
    type: "prevision",
    annee: 2026,
    obs: dernierObs(pibData),
  },
  {
    id: "masse",
    nom: NOMS.masse_monetaire,
    unite: UNITES.masse_monetaire,
    valeur: prevPar("masse_monetaire", 2026)?.valeur_prevue ?? null,
    type: "prevision",
    annee: 2026,
    obs: null,
  },
  {
    id: "taux",
    nom: NOMS.taux_change,
    unite: UNITES.taux_change,
    valeur: dernierObs(tauxChangeData)?.value ?? null,
    type: "observation",
    annee: dernierObs(tauxChangeData) ? anneeDe(dernierObs(tauxChangeData).period) : null,
    obs: null,
  },
];

// ---- 3. Table des prévisions 2026-2027 ----
const prevIndics = [...new Set(previsionsData.map((p) => p.indicateur))];
const prevRows = prevIndics.map((id) => {
  const items = previsionsData
    .filter((p) => p.indicateur === id)
    .sort((a, b) => a.annee - b.annee);
  return {
    id,
    nom: NOMS[id] || id,
    unite: UNITES[id] || "",
    y26: items.find((p) => p.annee === 2026) || null,
    y27: items.find((p) => p.annee === 2027) || null,
  };
});

// ---- 5. Comparaison des pays ----
const paysUniq = [...new Set(comparaisonData.map((r) => r.pays))];
const seriePour = (pays, indicateur) =>
  comparaisonData
    .filter((r) => r.pays === pays && r.indicateur === indicateur && r.valeur != null)
    .sort((a, b) => a.annee.localeCompare(b.annee));
const dernierePays = (s) => (s.length ? s[s.length - 1] : null);

const paysRows = paysUniq.map((pays) => {
  const pib = seriePour(pays, "pib");
  const infl = seriePour(pays, "inflation");
  const dPib = dernierePays(pib);
  const dInfl = dernierePays(infl);
  const varPib =
    pib.length >= 2
      ? ((pib[pib.length - 1].valeur - pib[pib.length - 2].valeur) / pib[pib.length - 2].valeur) *
        100
      : null;
  const annee = dPib ? anneeDe(dPib.annee) : dInfl ? anneeDe(dInfl.annee) : null;
  return { pays, dPib, dInfl, varPib, annee };
});

// ---- 4. Tendances (séries exportées) ----
const tendances = [
  { id: "inflation", nom: NOMS.inflation, unite: UNITES.inflation, periode: inflationData },
  { id: "pib", nom: NOMS.pib, unite: UNITES.pib, periode: pibData },
];

export default function Accueil() {
  const { t } = useTranslation();
  const alertes = construireAlertes(t);

  return (
    <div className="page accueil-page">
      {/* 1. En-tête de page */}
      <header className="accueil-head">
        <p className="accueil-eyebrow">{t("accueil2_eyebrow")}</p>
        <h1 className="accueil-title">{t("accueil2_titre")}</h1>
        <p className="accueil-desc">{t("accueil2_desc")}</p>
        <div className="accueil-meta">
          <span>
            {t("footer_datemaj")} : {DATE_MAJ ? `${DATE_MAJ} UTC` : t("comparer_nd")}
          </span>
          <span>
            {t("footer_sources")} : BCEAO · DBnomics
          </span>
        </div>
      </header>

      {/* 2. Indicateurs clés */}
      <section className="home-section" aria-label={t("accueil2_kpi_titre")}>
        <h2 className="home-section-title">{t("accueil2_kpi_titre")}</h2>
        <div className="kpi-grid">
          {kpis.map((k) => (
            <div key={k.id} className="kpi-card">
              <p className="kpi-label">{k.nom}</p>
              <p className="kpi-value">{k.valeur != null ? fmtV(k.valeur, k.unite) : t("comparer_nd")}</p>
              <p className="kpi-sub">
                {k.type === "prevision"
                  ? t("accueil2_kpi_prev", { annee: k.annee })
                  : t("accueil2_kpi_obs", { annee: k.annee ?? "" })}
                {k.obs && (
                  <>
                    {" · "}
                    {t("accueil2_kpi_obs", { annee: anneeDe(k.obs.period) })} :{" "}
                    {fmtV(k.obs.value, k.unite)}
                  </>
                )}
              </p>
              {k.type === "observation" && (
                <p className="kpi-acc">{t("prevision_indisponible")}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. Prévisions macroéconomiques */}
      <section className="home-section" aria-label={t("accueil2_prev_titre")}>
        <h2 className="home-section-title">{t("accueil2_prev_titre")}</h2>
        <p className="home-section-desc">{t("accueil2_prev_intro")}</p>
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
                <tr key={r.id}>
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
        <Link to="/previsions" className="link-more">{t("accueil2_prev_lien")}</Link>
      </section>

      {/* 4. Tendances récentes */}
      <section className="home-section" aria-label={t("accueil2_tend_titre")}>
        <h2 className="home-section-title">{t("accueil2_tend_titre")}</h2>
        <div className="charts-grid">
          {tendances.map((c) => {
            const data = c.periode.map(({ period, value }) => ({
              annee: anneeDe(period),
              valeur: value,
            }));
            const debut = data.length ? data[0].annee : null;
            const fin = data.length ? data[data.length - 1].annee : null;
            return (
              <div key={c.id} className="chart-box">
                <h4>
                  {c.nom} <span className="chart-meta">({c.unite})</span>
                </h4>
                <p className="chart-meta">
                  {debut != null ? `${debut}–${fin}` : ""} · {t("donnees_footer_source")}
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data}>
                    <CartesianGrid stroke="#eef0f2" vertical={false} />
                    <XAxis dataKey="annee" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={62}
                      tickFormatter={fmt0}
                    />
                    <Tooltip formatter={(v) => fmtV(v, c.unite)} />
                    <Line type="monotone" dataKey="valeur" stroke="#1d4ed8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Comparaison UEMOA */}
      <section className="home-section" aria-label={t("accueil2_comp_titre")}>
        <h2 className="home-section-title">{t("accueil2_comp_titre")}</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("accueil2_comp_pays")}</th>
                <th>{t("accueil2_comp_annee")}</th>
                <th className="num">{t("comparer_pib")}</th>
                <th className="num">{t("comparer_inflation")}</th>
                <th className="num">{t("comparer_croissance")}</th>
              </tr>
            </thead>
            <tbody>
              {paysRows.map((row) => (
                <tr key={row.pays}>
                  <td>{row.pays}</td>
                  <td>{row.annee ?? t("comparer_nd")}</td>
                  <td className="num">
                    {row.dPib ? `${fmt0(row.dPib.valeur)} Mds FCFA` : t("comparer_nd")}
                  </td>
                  <td className="num">
                    {row.dInfl ? `${fmt1(row.dInfl.valeur)} %` : t("comparer_nd")}
                  </td>
                  <td className="num">
                    {row.varPib != null ? `${fmt1(row.varPib)} %` : t("comparer_nd")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link to="/comparaison" className="link-more">{t("accueil2_comp_lien")}</Link>
      </section>

      {/* 6. Signaux calculés (mêmes règles que la Veille) */}
      <section className="home-section" aria-label={t("accueil2_sign_titre")}>
        <h2 className="home-section-title">{t("accueil2_sign_titre")}</h2>
        <p className="home-section-desc">{t("accueil2_sign_intro")}</p>
        <div className="signal-list">
          {alertes.slice(0, 3).map((a, i) => (
            <div key={i} className="signal-row">
              <span className="signal-badge">{t("accueil2_sign_badge")}</span>
              <div>
                <strong>{a.titre}</strong>
                <span>{a.texte}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Sources et méthodologie */}
      <section className="home-section" aria-label={t("accueil2_src_titre")}>
        <h2 className="home-section-title">{t("accueil2_src_titre")}</h2>
        <div className="src-list">
          <div className="src-row">
            <b>BCEAO</b>
            <span>{t("veille_source_bceao_texte")}</span>
          </div>
          <div className="src-row">
            <b>DBnomics</b>
            <span>{t("veille_source_dbnomics_texte")}</span>
          </div>
          <div className="src-row">
            <b>{t("footer_metho")}</b>
            <Link to="/methodologie">{t("accueil_resultats_lien")}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}