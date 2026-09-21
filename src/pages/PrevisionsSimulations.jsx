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

// Source de vérité pour les prévisions : previsions.json (via indicateurs.js
// pour les 3 séries principales, directement pour les 4 extra).
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

function formatValeur(v, unite) {
  const arrondi = v.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
  return unite === "%" ? `${arrondi} %` : `${arrondi} ${unite}`;
}

export default function PrevisionsSimulations() {
  const { t } = useTranslation();
  const [actifId, setActifId] = useState("pib");
  const option = OPTIONS.find((o) => o.id === actifId) || OPTIONS[0];
  const previsions = option.previsions;

  const historique = HISTORIQUE[option.id] || null;
  let chartData = null;
  if (historique && previsions.length > 0) {
    const histo = historique.map(({ period, value }) => ({
      annee: parseInt(period.slice(0, 4), 10),
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

  // Signal simple, calculé sur les données réelles : l'intervalle de confiance
  // traverse zéro, donc le signe de l'évolution n'est pas garanti.
  const icTraverseZero = previsions.some(
    (p) => p.borne_basse != null && p.borne_haute != null && p.borne_basse < 0 && p.borne_haute > 0
  );

  return (
    <section className="prev-sim-section">
      <h2 className="dynamic-section-title">{t("prevsim_titre")}</h2>
      <p className="prev-sim-note">{t("prevsim_note")}</p>

      <div className="prev-sim-layout">
        <div className="prev-sim-chart-card">
          {chartData ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="annee" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={64} />
                <Tooltip />
                <Line type="monotone" dataKey="valeur" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="prevValeur" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 4 }}>
                  <ErrorBar dataKey="icRange" width={8} strokeWidth={2} stroke="#c9a227" />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="prev-sim-chart-caption">{t("prevsim_chart_indispo")}</p>
          )}
          <p className="prev-sim-chart-caption">
            {chartData ? t("prevsim_chart_caption", { unite: option.unite }) : ""}
          </p>
        </div>

        <div className="prev-sim-scenarios">
          <p className="prev-sim-scenario-label">{t("prevsim_choisir")}</p>
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              className={`prev-sim-scenario-btn ${actifId === o.id ? "active" : ""}`}
              onClick={() => setActifId(o.id)}
            >
              <span className="prev-sim-scenario-nom">{o.nom}</span>
              <span className="prev-sim-scenario-desc">
                {o.previsions.length > 0 ? t("prevsim_horizon") : t("prevision_indisponible")}
              </span>
            </button>
          ))}
          <Link to="/donnees" className="cta-button prev-sim-cta">
            {t("prevsim_cta")}
          </Link>
        </div>
      </div>

      <div className="prev-sim-detail">
        {previsions.length > 0 ? (
          previsions.map((p) => (
            <div key={p.annee} className="prev-sim-year-card">
              <p className="forecast-label">
                {t("prevision_label")} {p.annee}
              </p>
              <p className="forecast-value">{formatValeur(p.valeur_prevue, option.unite)}</p>
              {p.borne_basse != null && p.borne_haute != null && (
                <p className="forecast-ic">
                  {t("prevision_ic")} : {formatValeur(p.borne_basse, option.unite)} –{" "}
                  {formatValeur(p.borne_haute, option.unite)}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="prev-sim-year-card">
            <p className="forecast-label">{t("prevision_label")}</p>
            <p className="forecast-value">—</p>
            <p className="forecast-ic">{t("prevision_indisponible")}</p>
          </div>
        )}
      </div>

      {icTraverseZero && (
        <p className="prev-sim-signal">{t("prevsim_signal_zero")}</p>
      )}
    </section>
  );
}