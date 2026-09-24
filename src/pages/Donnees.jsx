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
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { INDICATEURS } from "../data/indicateurs.js";
import metaData from "../data/meta.json";

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

function formatValeur(valeur, unite) {
  const arrondi = Number.isInteger(valeur) ? valeur : valeur.toFixed(1);
  return unite === "FCFA" || unite === "Mds FCFA"
    ? `${arrondi.toLocaleString("fr-FR")} ${unite}`
    : `${arrondi} ${unite}`;
}

function telechargerCSV(indicateur) {
  const entetes = "period,value,type\n";
  const lignes = indicateur.historique
    .map((ligne) => `${ligne.period},${ligne.value},observation`)
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
  const historique = indicateur?.historique || [];
  const previsions = indicateur?.previsions || [];

  // Période couverte, calculée depuis les données réelles.
  const anneeDebut = historique.length ? parseInt(historique[0].period.slice(0, 4), 10) : null;
  const anneeFin = historique.length ? parseInt(historique[historique.length - 1].period.slice(0, 4), 10) : null;
  const prevAnnees = previsions.map((p) => p.annee);
  const fin = prevAnnees.length ? Math.max(anneeFin ?? 0, Math.max(...prevAnnees)) : anneeFin;
  const periodeTexte =
    anneeDebut != null ? `${anneeDebut}–${fin != null ? fin : ""}` : t("comparer_nd");

  // Dernière observation disponible.
  const derObs =
    historique.length
      ? {
          annee: parseInt(historique[historique.length - 1].period.slice(0, 4), 10),
          valeur: historique[historique.length - 1].value,
        }
      : null;

  // Lignes de la table (observations puis prévisions).
  const rows = [
    ...historique.map((o) => ({
      periode: o.period.slice(0, 4),
      type: "obs",
      valeur: o.value,
      ic: null,
    })),
    ...previsions.map((p) => ({
      periode: `${p.annee}`,
      type: "prev",
      valeur: p.valeur_prevue,
      ic:
        p.borne_basse != null && p.borne_haute != null
          ? `${formatValeur(p.borne_basse, indicateur.unite)} – ${formatValeur(p.borne_haute, indicateur.unite)}`
          : null,
    })),
  ];

  // Données du graphique : historique + prévisions (avec IC 95 %).
  const dernier = historique.length ? historique[historique.length - 1] : null;
  const chartData = [
    ...historique.map((o) => ({
      annee: parseInt(o.period.slice(0, 4), 10),
      obs: o.value,
      prev: null,
    })),
    { annee: dernier ? parseInt(dernier.period.slice(0, 4), 10) : null, obs: null, prev: dernier ? dernier.value : null, icRange: null },
    ...previsions.map((p) => ({
      annee: p.annee,
      obs: null,
      prev: p.valeur_prevue,
      icRange:
        p.borne_basse != null && p.borne_haute != null
          ? [p.borne_basse, p.borne_haute]
          : undefined,
    })),
  ].filter((r) => r.annee != null);

  return (
    <div className="page donnees-page">
      {/* 1. En-tête de page */}
      <header className="accueil-head">
        <p className="accueil-eyebrow">{t("donnees3_eyebrow")}</p>
        <h1 className="accueil-title">{t("donnees3_titre")}</h1>
        <p className="accueil-desc">{t("donnees3_desc")}</p>
        <div className="accueil-meta">
          <span>{t("footer_datemaj")} : {DATE_MAJ ? `${DATE_MAJ} UTC` : t("comparer_nd")}</span>
          <span>{t("footer_sources")} : BCEAO · DBnomics</span>
        </div>
      </header>

      {/* 2. Sélection de l'indicateur */}
      <nav className="tabs data-tabs" role="tablist" aria-label={t("donnees_hero_eyebrow")}>
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

      {/* 3. En-tête de série */}
      <section className="series-head">
        <div className="series-title-line">
          <h2>{indicateur.nom}</h2>
          <span className="series-unite">{t("accueil2_col_unite")} : {indicateur.unite}</span>
        </div>
        <div className="series-meta">
          <span>{t("donnees3_periode")} : {periodeTexte}</span>
          <span>
            {t("donnees3_type")} :{" "}
            {previsions.length > 0 ? t("donnees3_type_obs_prev") : t("donnees3_type_obs")}
          </span>
          <span>{indicateur.sousTitre}</span>
        </div>
      </section>

      {/* 4. Valeurs : dernière observation + prévisions */}
      <div className="values-strip" role="group" aria-label={t("donnees3_titre")}>
        <div className="value-box">
          <p className="value-label">{t("donnees3_derniere_obs")}</p>
          <p className="value-digit">{derObs ? formatValeur(derObs.valeur, indicateur.unite) : t("comparer_nd")}</p>
          <p className="value-period">{t("donnees3_annee")} : {derObs ? derObs.annee : t("comparer_nd")}</p>
        </div>
        {previsions.map((p) => (
          <div key={p.annee} className="value-box">
            <p className="value-label">{t("prevision_label")} {p.annee}</p>
            <p className="value-digit">{formatValeur(p.valeur_prevue, indicateur.unite)}</p>
            {p.borne_basse != null && p.borne_haute != null && (
              <p className="value-period">
                {t("prevision_ic")} : {formatValeur(p.borne_basse, indicateur.unite)} –{" "}
                {formatValeur(p.borne_haute, indicateur.unite)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 5. Graphique principal */}
      {historique.length > 1 && (
        <section className="home-section" aria-label={indicateur.nom}>
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
                <Tooltip content={<CustomTooltip unite={indicateur.unite} />} />
                <Line type="monotone" dataKey="obs" stroke="#94a3b8" strokeWidth={2} dot={false} />
                {previsions.length > 0 && (
                  <Line type="monotone" dataKey="prev" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 4 }}>
                    <ErrorBar dataKey="icRange" width={8} strokeWidth={2} stroke="#a8860d" />
                  </Line>
                )}
              </LineChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              <span><i className="key key-obs" /> {t("donnees3_legend_obs")}</span>
              {previsions.length > 0 && (
                <span><i className="key key-prev" /> {t("donnees3_legend_prev")}</span>
              )}
            </div>
            <p className="chart-meta">
              {t("donnees_footer_source")} · {t("donnees3_periode")} : {periodeTexte}
            </p>
          </div>
        </section>
      )}

      {/* 6. Table de données */}
      <section className="home-section" aria-label={`${indicateur.nom} — ${t("donnees3_titre")}`}>
        <h2 className="home-section-title">{indicateur.nom} — {t("donnees3_titre")}</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("donnees3_periode")}</th>
                <th className="num">{t("donnees3_valeur")} ({indicateur.unite})</th>
                <th>{t("donnees3_type")}</th>
                <th className="num">{t("prevision_ic")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.periode}-${r.type}`}>
                  <td>{r.periode}</td>
                  <td className="num">{formatValeur(r.valeur, indicateur.unite)}</td>
                  <td>
                    {r.type === "obs" ? t("donnees3_type_obs") : t("prevision_label")}
                  </td>
                  <td className="num muted">{r.ic ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. Téléchargements */}
      <section className="downloads home-section" aria-label={t("donnees3_download")}>
        <span className="downloads-label">{t("donnees3_download")}</span>
        <button onClick={() => telechargerCSV(indicateur)}>{t("telecharger_csv")}</button>
        <button onClick={() => telechargerJSON(indicateur)}>{t("telecharger_json")}</button>
        <button onClick={() => telechargerPDF(indicateur)}>{t("telecharger_pdf")}</button>
      </section>

      {/* 8. Métadonnées */}
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
            <b>{t("accueil2_col_unite")}</b>
            <span>{indicateur.unite}</span>
          </div>
          <div className="metadata-row">
            <b>{t("donnees3_periode")}</b>
            <span>{periodeTexte}</span>
          </div>
          <div className="metadata-row">
            <b>{t("donnees3_meta_modele")}</b>
            <span>SARIMA {indicateur.ordreSarima} · MAE {indicateur.mae} ({t("precision_caption")})</span>
          </div>
        </div>
      </section>
    </div>
  );
}