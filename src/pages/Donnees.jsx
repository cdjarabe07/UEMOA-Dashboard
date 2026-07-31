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
import { INDICATEURS } from "../data/indicateurs.js";

function formatValeur(valeur, unite) {
  const arrondi = Number.isInteger(valeur) ? valeur : valeur.toFixed(1);
  return unite === "FCFA" || unite === "Mds FCFA"
    ? `${arrondi.toLocaleString("fr-FR")} ${unite}`
    : `${arrondi} ${unite}`;
}

function Stamp({ indicateur }) {
  return (
    <div className="stamp" role="img" aria-label={`Précision du modèle : erreur moyenne de ${indicateur.mae}`}>
      <p className="stamp-kicker">Précision (MAE)</p>
      <p className="stamp-value">{indicateur.mae}</p>
      <p className="stamp-caption">erreur moyenne sur validation glissante</p>
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
  const [actifId, setActifId] = useState(INDICATEURS[0].id);
  const indicateur = INDICATEURS.find((i) => i.id === actifId);

  return (
    <div className="page">
      <header className="hero">
        <p className="hero-eyebrow">BCEAO · UEMOA · Prévision macroéconomique</p>
        <h1 className="hero-title">
          Trois indicateurs, trois verdicts sur ce qui se prévoit vraiment.
        </h1>
        <p className="hero-sub">
          Inflation, taux de change et PIB du Sénégal, comparés entre un modèle
          naïf et le meilleur SARIMA trouvé par recherche systématique — sans
          maquiller les cas où le modèle simple gagne.
        </p>
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
            <p className="forecast-label">Prévision {indicateur.prevision.annee}</p>
            <p className="forecast-value">
              {formatValeur(indicateur.prevision.valeur, indicateur.unite)}
            </p>
          </div>
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

          <Stamp indicateur={indicateur} />
        </div>
      </section>

      <footer className="footer">
        <span>Source : BCEAO, via DBnomics</span>
        <span>Pipeline complet sur GitHub</span>
      </footer>
    </div>
  );
}
