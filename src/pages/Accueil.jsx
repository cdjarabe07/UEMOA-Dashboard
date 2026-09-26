import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import {
  Percent,
  Landmark,
  Coins,
  ArrowLeftRight,
  Database,
  ChartLine,
  Globe,
  BellRing,
  FileDown,
  ArrowRight,
} from "lucide-react";
import previsionsData from "../data/previsions.json";
import comparaisonData from "../data/comparaison_pays.json";
import inflationData from "../data/inflation_senegal.json";
import pibData from "../data/pib_senegal.json";
import tauxChangeData from "../data/taux_change_uemoa.json";
import { INDICATEURS } from "../data/indicateurs.js";
import VeillePublicationsAlertes, { construireAlertes } from "./VeillePublicationsAlertes";
import {
  COULEURS,
  DATE_MAJ,
  fmt0,
  fmt1,
  fmt2,
  fmtV,
  anneeDe,
  nomIndicateur,
  construireSerie,
  GraphiquePrevision,
  LegendePrevision,
} from "./Visuels";

// Métadonnées d'affichage uniquement (aucune valeur économique ici).
const UNITES = {
  inflation: "%",
  pib: "Mds FCFA",
  agriculture: "Mds FCFA",
  industrie: "Mds FCFA",
  services: "Mds FCFA",
  masse_monetaire: "Mds FCFA",
  taux_change: "FCFA",
};

const dernierObs = (data) => (data.length ? data[data.length - 1] : null);
const prevPar = (id, annee) =>
  previsionsData.find((p) => p.indicateur === id && p.annee === annee);

// Historiques réellement exportés dans le frontend.
const HISTORIQUE = { inflation: inflationData, pib: pibData, taux_change: tauxChangeData };

// Modèles réellement documentés dans indicateurs.js.
const MODELES = Object.fromEntries(INDICATEURS.map((i) => [i.id, { ordre: i.ordreSarima, mae: i.mae }]));

// ---- 2. Indicateurs clés (prévision 2026 ou dernière observation) ----
const KPIS = [
  { id: "inflation", Icone: Percent, fond: "#fef3c7", encre: "#b45309", annee: 2026, obs: dernierObs(inflationData) },
  { id: "pib", Icone: Landmark, fond: "#e0e7ff", encre: "#4338ca", annee: 2026, obs: dernierObs(pibData) },
  { id: "masse_monetaire", Icone: Coins, fond: "#dcfce7", encre: "#15803d", annee: 2026, obs: null },
  { id: "taux_change", Icone: ArrowLeftRight, fond: "#f3e8ff", encre: "#7e22ce", annee: null, obs: dernierObs(tauxChangeData) },
].map((k) => ({ ...k, unite: UNITES[k.id], prev: k.annee ? prevPar(k.id, k.annee) : null }));

// ---- 3. Évolution historique ----
const TENDANCES = [
  { id: "inflation", couleur: COULEURS.gold, data: inflationData },
  { id: "pib", couleur: "#1d4ed8", data: pibData },
  { id: "taux_change", couleur: COULEURS.teal, data: tauxChangeData },
].map((c) => {
  const serie = c.data.map(({ period, value }) => ({ annee: anneeDe(period), valeur: value }));
  const der = serie[serie.length - 1] || null;
  const avant = serie[serie.length - 2] || null;
  return {
    ...c,
    unite: UNITES[c.id],
    serie,
    der,
    variation: der && avant ? der.valeur - avant.valeur : null,
    debut: serie.length ? serie[0].annee : null,
  };
});

// ---- 4. Prévisions 2026-2027 ----
const PREV_IDS = [...new Set(previsionsData.map((p) => p.indicateur))];
const PREV_ANNEES = previsionsData.map((p) => p.annee);
const PERIODE_PREV = PREV_ANNEES.length ? `${Math.min(...PREV_ANNEES)}–${Math.max(...PREV_ANNEES)}` : "";

// ---- 5. Comparaison des pays ----
const PAYS_DISPO = [...new Set(comparaisonData.map((r) => r.pays))];
const seriePour = (pays, indicateur) =>
  comparaisonData
    .filter((r) => r.pays === pays && r.indicateur === indicateur && r.valeur != null)
    .sort((a, b) => a.annee.localeCompare(b.annee));

const FICHES_PAYS = Object.fromEntries(
  PAYS_DISPO.map((pays) => {
    const pib = seriePour(pays, "pib");
    const infl = seriePour(pays, "inflation");
    const dPib = pib[pib.length - 1] || null;
    const pPib = pib[pib.length - 2] || null;
    return [
      pays,
      {
        dPib,
        dInfl: infl[infl.length - 1] || null,
        varPib: dPib && pPib && pPib.valeur ? ((dPib.valeur - pPib.valeur) / pPib.valeur) * 100 : null,
        sparkline: pib.slice(-15).map((r) => ({ annee: anneeDe(r.annee), valeur: r.valeur })),
      },
    ];
  })
);
const PIB_MAX = Math.max(0, ...PAYS_DISPO.map((p) => FICHES_PAYS[p].dPib?.valeur ?? 0));

// Carte schématique : positions indicatives (pas un tracé géographique réel).
// Seuls les pays présents dans comparaison_pays.json sont activables.
const CARTE = [
  { nom: "Sénégal", x: 9, y: 36 },
  { nom: "Mali", x: 31, y: 22 },
  { nom: "Niger", x: 58, y: 24 },
  { nom: "Guinée-Bissau", x: 7, y: 50 },
  { nom: "Burkina Faso", x: 41, y: 40 },
  { nom: "Côte d'Ivoire", x: 29, y: 58 },
  { nom: "Bénin", x: 55, y: 52 },
  { nom: "Togo", x: 49, y: 58 },
].map((p) => ({ ...p, disponible: PAYS_DISPO.includes(p.nom) }));

// ---- 7. Plateforme : chiffres dérivés des fichiers exportés ----
const NB_SERIES = Object.keys(HISTORIQUE).length;
const ANNEES_HISTO = Object.values(HISTORIQUE).flatMap((s) => s.map((o) => anneeDe(o.period)));
const PERIODE_HISTO = ANNEES_HISTO.length ? `${Math.min(...ANNEES_HISTO)}–${Math.max(...ANNEES_HISTO)}` : "";

function CarteKpi({ k, t }) {
  const valeur = k.prev ? k.prev.valeur_prevue : k.obs ? k.obs.value : null;
  return (
    <article className="feature-card kpi-feature">
      <div className="feature-icon-box" style={{ background: k.fond, color: k.encre }}>
        <k.Icone />
      </div>
      <p className="kpi-feature-label">
        {nomIndicateur(t, k.id)}
        <span className="kpi-feature-tag">
          {k.prev ? `${t("prevision_label")} ${k.annee}` : `${t("donnees3_type_obs")} ${k.obs ? anneeDe(k.obs.period) : ""}`}
        </span>
      </p>
      <p className="kpi-feature-value">{valeur != null ? fmtV(valeur, k.unite) : t("comparer_nd")}</p>
      <p className="feature-desc">
        {k.prev && k.prev.borne_basse != null
          ? `${t("prevision_ic")} : ${fmtV(k.prev.borne_basse, k.unite)} – ${fmtV(k.prev.borne_haute, k.unite)}`
          : t("prevision_indisponible")}
        {k.prev && k.obs && (
          <>
            <br />
            {t("donnees3_derniere_obs")} ({anneeDe(k.obs.period)}) : {fmtV(k.obs.value, k.unite)}
          </>
        )}
      </p>
      <Link to={k.prev ? "/previsions" : "/donnees"} className="feature-link">
        {k.prev ? t("accueil3_kpi_lien_prev") : t("accueil3_kpi_lien_donnees")}
      </Link>
    </article>
  );
}

export default function Accueil() {
  const { t } = useTranslation();
  const [prevActif, setPrevActif] = useState(PREV_IDS.includes("pib") ? "pib" : PREV_IDS[0]);
  const [paysActif, setPaysActif] = useState(PAYS_DISPO[0]);
  const alertes = construireAlertes(t);

  const libelles = {
    obs: t("donnees3_legend_obs"),
    prev: t("donnees3_legend_prev"),
    ic: t("prevision_ic"),
  };
  const prevSelection = previsionsData
    .filter((p) => p.indicateur === prevActif)
    .sort((a, b) => a.annee - b.annee);
  const histoSelection = HISTORIQUE[prevActif] || [];
  const serieSelection = construireSerie(histoSelection, prevSelection, 2000);
  const modeleSelection = MODELES[prevActif];
  const fiche = FICHES_PAYS[paysActif];

  const plateforme = [
    { Icone: Database, to: "/donnees", titre: t("accueil3_pf_donnees"), desc: t("accueil3_pf_donnees_desc", { n: NB_SERIES, periode: PERIODE_HISTO }) },
    { Icone: ChartLine, to: "/previsions", titre: t("accueil3_pf_prev"), desc: t("accueil3_pf_prev_desc", { n: PREV_IDS.length, periode: PERIODE_PREV }) },
    { Icone: Globe, to: "/comparaison", titre: t("accueil3_pf_comp"), desc: t("accueil3_pf_comp_desc", { n: PAYS_DISPO.length }) },
    { Icone: BellRing, to: "/previsions", titre: t("accueil3_pf_signaux"), desc: t("accueil3_pf_signaux_desc", { n: alertes.length }) },
    { Icone: FileDown, to: "/donnees", titre: t("accueil3_pf_exports"), desc: t("accueil3_pf_exports_desc") },
  ];

  return (
    <div className="page-full">
      {/* 1. Présentation de l'observatoire */}
      <section className="hero-full">
        <div className="hero-full-inner">
          <p className="hero-eyebrow-light">{t("accueil3_eyebrow")}</p>
          <h1 className="hero-title">{t("titre_hero")}</h1>
          <div className="hero-divider"></div>
          <p className="hero-sub">{t("sous_titre_hero")}</p>
          <div className="hero-actions">
            <Link to="/donnees" className="cta-button cta-button--solid">
              {t("cta_explorer")}
            </Link>
            <Link to="/previsions" className="cta-button">
              {t("accueil3_cta_prev")}
            </Link>
          </div>
          <p className="hero-meta">
            {DATE_MAJ && (
              <span>
                {t("footer_datemaj")} : {DATE_MAJ} UTC
              </span>
            )}
            <span>{t("footer_sources")} : BCEAO · DBnomics</span>
          </p>
        </div>
      </section>

      {/* 2. Indicateurs macroéconomiques clés */}
      <section className="features-strip" aria-label={t("accueil2_kpi_titre")}>
        <div className="features-grid">
          {KPIS.map((k) => (
            <CarteKpi key={k.id} k={k} t={t} />
          ))}
        </div>
      </section>

      {/* 3. Évolution historique */}
      <section className="home-block" aria-label={t("accueil3_histo_titre")}>
        <div className="home-block-head">
          <div>
            <p className="section-kicker">{t("accueil3_histo_kicker")}</p>
            <h2 className="dynamic-section-title">{t("accueil3_histo_titre")}</h2>
          </div>
          <Link to="/donnees" className="veille-voir-tout">
            {t("veille_voir_tout")}
          </Link>
        </div>
        <div className="trend-grid">
          {TENDANCES.map((c) => (
            <article key={c.id} className="trend-card">
              <div className="trend-card-head">
                <div>
                  <h3 className="trend-card-title">{nomIndicateur(t, c.id)}</h3>
                  <p className="trend-card-meta">
                    {c.debut}–{c.der?.annee} · {c.unite}
                  </p>
                </div>
                {c.der && (
                  <div className="trend-card-last">
                    <span className="trend-card-value">{fmtV(c.der.valeur, c.unite)}</span>
                    {c.variation != null && (
                      <span className={`trend-delta ${c.variation >= 0 ? "up" : "down"}`}>
                        {c.variation >= 0 ? "▲" : "▼"} {fmt1(Math.abs(c.variation))}
                        {c.unite === "%" ? " pt" : ""} {t("accueil3_vs")} {c.der.annee - 1}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={c.serie} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                  <defs>
                    <linearGradient id={`grad-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c.couleur} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={c.couleur} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="annee"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    ticks={[c.debut, c.der?.annee].filter((v) => v != null)}
                    interval={0}
                    padding={{ left: 14, right: 14 }}
                    tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip
                    formatter={(v) => [fmtV(v, c.unite), nomIndicateur(t, c.id)]}
                    labelFormatter={(l) => l}
                    contentStyle={{ fontFamily: "IBM Plex Mono", fontSize: 12, borderRadius: 8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="valeur"
                    stroke={c.couleur}
                    strokeWidth={2}
                    fill={`url(#grad-${c.id})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <p className="trend-card-source">{t("donnees_footer_source")}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Prévisions 2026-2027 */}
      <section className="forecast-band" aria-label={t("accueil3_prev_titre")}>
        <div className="forecast-band-inner">
          <div className="home-block-head">
            <div>
              <p className="section-kicker section-kicker--gold">{t("accueil3_prev_kicker")}</p>
              <h2 className="forecast-band-title">{t("accueil3_prev_titre")}</h2>
              <p className="forecast-band-sub">{t("accueil2_prev_intro")}</p>
            </div>
            <Link to="/previsions" className="forecast-band-link">
              {t("accueil2_prev_lien")}
            </Link>
          </div>
          <div className="prev-sim-layout">
            <div className="chart-card">
              <div className="chart-card-head">
                <h3>{nomIndicateur(t, prevActif)}</h3>
                <span>{UNITES[prevActif]}</span>
              </div>
              <GraphiquePrevision data={serieSelection} unite={UNITES[prevActif]} libelles={libelles} height={300} />
              <LegendePrevision libelles={libelles} />
              <p className="chart-card-foot">
                {histoSelection.length ? t("accueil3_prev_depuis") : t("prevsim4_histo_indispo")}
                {modeleSelection && ` · SARIMA ${modeleSelection.ordre} · MAE ${fmt2(modeleSelection.mae)}`}
              </p>
            </div>
            <div className="prev-sim-scenarios" role="tablist" aria-label={t("prevsim_choisir")}>
              {PREV_IDS.map((id) => {
                const p26 = prevPar(id, 2026);
                const p27 = prevPar(id, 2027);
                return (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={id === prevActif}
                    className={`prev-sim-scenario-btn ${id === prevActif ? "active" : ""}`}
                    onClick={() => setPrevActif(id)}
                  >
                    <span className="prev-sim-scenario-nom">{nomIndicateur(t, id)}</span>
                    <span className="prev-sim-scenario-vals">
                      {p26 && <span>2026 <b>{fmtV(p26.valeur_prevue, UNITES[id])}</b></span>}
                      {p27 && <span>2027 <b>{fmtV(p27.valeur_prevue, UNITES[id])}</b></span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Comparaison entre pays */}
      <section className="carte-pays-section" aria-label={t("comparer_titre")}>
        <div className="home-block-head">
          <div>
            <p className="section-kicker">{t("accueil3_comp_kicker")}</p>
            <h2 className="dynamic-section-title">{t("comparer_titre")}</h2>
          </div>
          <Link to="/comparaison" className="veille-voir-tout">
            {t("accueil2_comp_lien")}
          </Link>
        </div>
        <div className="carte-pays-layout">
          <div className="carte-pays-svg-wrapper">
            <svg viewBox="0 0 66 70" className="carte-pays-svg" role="group" aria-label={t("comparer_titre")}>
              <rect x="0" y="0" width="66" height="70" rx="5" fill="#f3f5f8" />
              {CARTE.map((p) => {
                const actif = p.nom === paysActif;
                return (
                  <g
                    key={p.nom}
                    onClick={() => p.disponible && setPaysActif(p.nom)}
                    style={{ cursor: p.disponible ? "pointer" : "default" }}
                    role={p.disponible ? "button" : undefined}
                    aria-label={p.nom}
                  >
                    {actif && <circle cx={p.x} cy={p.y} r="6" fill={COULEURS.gold} opacity="0.18" />}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={actif ? 3.8 : 3}
                      fill={!p.disponible ? "#d1d5db" : actif ? COULEURS.gold : "#1d4ed8"}
                      className="carte-pays-point"
                    />
                    <text
                      x={p.x}
                      y={p.y - 5}
                      fontSize="2.5"
                      textAnchor="middle"
                      fill={p.disponible ? "#1f2937" : "#9ca3af"}
                      fontFamily="IBM Plex Sans, sans-serif"
                      fontWeight={actif ? 600 : 400}
                    >
                      {p.nom}
                    </text>
                  </g>
                );
              })}
            </svg>
            <p className="carte-pays-note">{t("accueil3_carte_note")}</p>
          </div>

          <div className="carte-pays-panel">
            <div className="carte-pays-panel-head">
              <h3 className="carte-pays-panel-titre">{paysActif}</h3>
              <span className="carte-pays-annee">
                {fiche?.dPib ? `${t("donnees3_annee")} ${anneeDe(fiche.dPib.annee)}` : ""}
              </span>
            </div>
            <div className="carte-pays-indicateurs">
              <div className="carte-pays-indicateur">
                <span className="carte-pays-indicateur-label">{t("comparer_pib")}</span>
                <span className="carte-pays-indicateur-valeur">
                  {fiche?.dPib ? `${fmt0(fiche.dPib.valeur)}` : t("comparer_nd")}
                  <small> Mds FCFA</small>
                </span>
              </div>
              <div className="carte-pays-indicateur">
                <span className="carte-pays-indicateur-label">{t("comparer_inflation")}</span>
                <span className="carte-pays-indicateur-valeur">
                  {fiche?.dInfl ? `${fmt1(fiche.dInfl.valeur)} %` : t("comparer_nd")}
                </span>
              </div>
              <div className="carte-pays-indicateur">
                <span className="carte-pays-indicateur-label">{t("compar5_variation")}</span>
                <span className="carte-pays-indicateur-valeur">
                  {fiche?.varPib != null ? `${fiche.varPib >= 0 ? "+" : ""}${fmt1(fiche.varPib)} %` : t("comparer_nd")}
                </span>
              </div>
            </div>
            {fiche?.sparkline.length > 1 && (
              <div className="carte-pays-spark">
                <p className="carte-pays-indicateur-label">
                  {t("comparer_pib")} {fiche.sparkline[0].annee}–{fiche.sparkline[fiche.sparkline.length - 1].annee}
                </p>
                <ResponsiveContainer width="100%" height={70}>
                  <AreaChart data={fiche.sparkline} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="grad-spark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={["auto", "auto"]} />
                    <Area type="monotone" dataKey="valeur" stroke="#1d4ed8" strokeWidth={2} fill="url(#grad-spark)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="carte-pays-ranking">
              <p className="carte-pays-indicateur-label">{t("accueil3_comp_classement")}</p>
              {[...PAYS_DISPO]
                .sort((a, b) => (FICHES_PAYS[b].dPib?.valeur ?? 0) - (FICHES_PAYS[a].dPib?.valeur ?? 0))
                .map((pays) => {
                  const v = FICHES_PAYS[pays].dPib?.valeur;
                  return (
                    <button
                      key={pays}
                      className={`rank-row ${pays === paysActif ? "active" : ""}`}
                      onClick={() => setPaysActif(pays)}
                    >
                      <span className="rank-nom">{pays}</span>
                      <span className="rank-bar">
                        <i style={{ width: v && PIB_MAX ? `${(v / PIB_MAX) * 100}%` : 0 }} />
                      </span>
                      <span className="rank-val">{v != null ? fmt0(v) : t("comparer_nd")}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Signaux calculés */}
      <VeillePublicationsAlertes />

      {/* 7. Plateforme */}
      <section className="plateforme-section">
        <h2 className="plateforme-titre">{t("accueil3_pf_titre")}</h2>
        <p className="plateforme-sous-titre">{t("accueil3_pf_sous_titre")}</p>
        <div className="plateforme-grid">
          {plateforme.map((item) => (
            <Link key={item.titre} to={item.to} className="plateforme-item">
              <div className="plateforme-item-icon">
                <item.Icone />
              </div>
              <h3 className="plateforme-item-titre">{item.titre}</h3>
              <p className="plateforme-item-desc">{item.desc}</p>
              <span className="plateforme-item-lien">
                {t("accueil3_pf_ouvrir")} <ArrowRight size={13} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. Sources et méthodologie */}
      <section className="partenaires-strip" aria-label={t("accueil2_src_titre")}>
        <div className="sources-row">
          <div>
            <p className="partenaires-titre">{t("accueil3_sources_titre")}</p>
            <div className="partenaires-logos">
              <span className="partenaire-logo">BCEAO</span>
              <span className="partenaire-logo">DBnomics</span>
            </div>
          </div>
          <p className="sources-texte">
            {t("veille_source_bceao_texte")}{" "}
            <Link to="/methodologie" className="feature-link">
              {t("accueil_resultats_lien")}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
