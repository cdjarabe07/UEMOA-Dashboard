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
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { INDICATEURS } from "../data/indicateurs.js";
 
function formatValeur(valeur, unite) {
  const arrondi = Number.isInteger(valeur) ? valeur : valeur.toFixed(1);
  return unite === "FCFA" || unite === "Mds FCFA"
    ? `${arrondi.toLocaleString("fr-FR")} ${unite}`
    : `${arrondi} ${unite}`;
}
 
function telechargerCSV(indicateur) {
  const entetes = "period,value\n";
  const lignes = indicateur.historique
    .map((ligne) => `${ligne.period},${ligne.value}`)
    .join("\n");
  const contenu = entetes + lignes;
 
  const blob = new Blob([contenu], { type: "text/csv;charset=utf-8;" });
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(blob);
  lien.download = `${indicateur.id}.csv`;
  lien.click();
}
 
function telechargerJSON(indicateur) {
  const contenu = JSON.stringify(indicateur.historique, null, 2);
  const blob = new Blob([contenu], { type: "application/json" });
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(blob);
  lien.download = `${indicateur.id}.json`;
  lien.click();
}
 
function telechargerPDF(indicateur) {
  const doc = new jsPDF();
 
  doc.setFontSize(14);
  doc.text(indicateur.nom, 14, 16);
  doc.setFontSize(10);
  doc.text("Source : BCEAO, via DBnomics", 14, 22);
 
  autoTable(doc, {
    startY: 28,
    head: [["Année", `Valeur (${indicateur.unite})`]],
    body: indicateur.historique.map((ligne) => [ligne.period, ligne.value]),
  });
 
  doc.save(`${indicateur.id}.pdf`);
}
 
function Stamp({ indicateur, t }) {
  return (
    <div className="stamp" role="img" aria-label={`${t("precision_mae")} : ${indicateur.mae}`}>
      <p className="stamp-kicker">{t("precision_mae")}</p>
      <p className="stamp-value">{indicateur.mae}</p>
      <p className="stamp-caption">{t("precision_caption")}</p>
      <p className="stamp-order">SARIMA {indicateur.ordreSarima}</p>
    </div>
  );
}
 
function CustomTooltip({ active, payload, label, unite }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "#1d3352",
        border: "1px solid rgba(237,233,223,0.2)",
        borderRadius: 4,
        padding: "8px 12px",
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: 12,
      }}
    >
      <div style={{ color: "#93a1b8", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#e0c25f" }}>{formatValeur(payload[0].value, unite)}</div>
    </div>
  );
}
 
export default function Donnees() {
  const { t } = useTranslation();
  const [actifId, setActifId] = useState(INDICATEURS[0].id);
  const indicateur = INDICATEURS.find((i) => i.id === actifId);
 
  return (
    <div className="page">
      <header className="hero">
        <p className="hero-eyebrow">{t("donnees_hero_eyebrow")}</p>
        <h1 className="hero-title">{t("donnees_hero_titre")}</h1>
        <p className="hero-sub">{t("donnees_hero_sub")}</p>
      </header>
 
      <nav className="tabs" role="tablist" aria-label="Choisir un indicateur">
        {INDICATEURS.map((i) => (
          <button
            key={i.id}
            className="tab"
            role="tab"
            aria-selected={i.id === actifId}
            data-active={i.id === actifId}
            onClick={() => setActifId(i.id)}
          >
            {i.nom}
          </button>
        ))}
      </nav>
 
      <section>
        <div className="entry-head">
          <div>
            <h2 className="entry-title">{indicateur.nom}</h2>
            <p className="entry-subtitle">{indicateur.sousTitre}</p>
          </div>
          <div className="forecast-block">
            <p className="forecast-label">{t("prevision_label")} {indicateur.prevision.annee}</p>
            <p className="forecast-value">
              {formatValeur(indicateur.prevision.valeur, indicateur.unite)}
            </p>
          </div>
        </div>
 
        <div className="export-buttons">
          <button onClick={() => telechargerCSV(indicateur)}>{t("telecharger_csv")}</button>
          <button onClick={() => telechargerJSON(indicateur)}>{t("telecharger_json")}</button>
          <button onClick={() => telechargerPDF(indicateur)}>{t("telecharger_pdf")}</button>
        </div>
 
        <div className="entry-body">
          <div className="chart-card">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={indicateur.historique}>
                <CartesianGrid stroke="rgba(237,233,223,0.08)" vertical={false} />
                <XAxis
                  dataKey="period"
                  stroke="#93a1b8"
                  tick={{ fontFamily: "IBM Plex Mono", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(237,233,223,0.14)" }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#93a1b8"
                  tick={{ fontFamily: "IBM Plex Mono", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={54}
                />
                <Tooltip content={<CustomTooltip unite={indicateur.unite} />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#c9a227"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#0f1b2d", stroke: "#c9a227", strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
 
          <Stamp indicateur={indicateur} t={t} />
        </div>
      </section>
 
      <footer className="footer">
        <span>{t("donnees_footer_source")}</span>
        <span>{t("donnees_footer_github")}</span>
      </footer>
    </div>
  );
}