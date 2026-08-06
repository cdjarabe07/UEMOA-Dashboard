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

// Base : prévisions PIB Sénégal 2026-2027 (chantier 2)
const BASE = [
  { annee: "2023", value: 20050 },
  { annee: "2024", value: 20870 },
  { annee: "2025", value: 21400 },
  { annee: "2026", value: 21920 },
  { annee: "2027", value: 23476 },
];

// Facteurs illustratifs (pas des sorties SARIMAX réelles — voir note méthodologie)
const SCENARIOS = [
  {
    id: "base",
    nom: "Scénario de base",
    description: "Trajectoire actuelle, sans choc externe.",
    facteur: 1,
  },
  {
    id: "petrole",
    nom: "Hausse du pétrole (+20%)",
    description: "Impact illustratif d'un choc pétrolier sur l'inflation importée.",
    facteur: 0.94,
  },
  {
    id: "inflation",
    nom: "Poussée d'inflation",
    description: "Scénario d'inflation durablement au-dessus de la cible BCEAO.",
    facteur: 0.9,
  },
  {
    id: "secheresse",
    nom: "Sécheresse sévère",
    description: "Choc négatif sur la production agricole et le PIB.",
    facteur: 0.88,
  },
  {
    id: "fcfa",
    nom: "Dépréciation du FCFA",
    description: "Effet illustratif d'une dépréciation sur les échanges extérieurs.",
    facteur: 1.05,
  },
];

export default function PrevisionsSimulations() {
  const [scenarioId, setScenarioId] = useState("base");
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);

  const donnees = BASE.map((point, i) => {
    // seules les deux dernières années (prévisions) sont affectées par le scénario
    const estPrevision = i >= 3;
    return {
      ...point,
      value: estPrevision ? Math.round(point.value * scenario.facteur) : point.value,
    };
  });

  return (
    <section className="prev-sim-section">
      <h2 className="dynamic-section-title">Prévisions et simulations économiques</h2>
      <p className="prev-sim-note">
        Les scénarios ci-dessous sont illustratifs — le lien statistique entre
        variables exogènes et prévisions n'a pas encore été établi de façon
        fiable (voir méthodologie). Ils montrent l'ordre de grandeur d'un choc,
        pas une prévision validée.
      </p>

      <div className="prev-sim-layout">
        <div className="prev-sim-chart-card">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={donnees}>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="annee" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip />
              <Line
                key={scenarioId}
                type="monotone"
                dataKey="value"
                stroke="#1d4ed8"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                isAnimationActive={true}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="prev-sim-chart-caption">PIB nominal du Sénégal (Mds FCFA) — {scenario.nom}</p>
        </div>

        <div className="prev-sim-scenarios">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              className={`prev-sim-scenario-btn ${scenarioId === s.id ? "active" : ""}`}
              onClick={() => setScenarioId(s.id)}
            >
              <span className="prev-sim-scenario-nom">{s.nom}</span>
              <span className="prev-sim-scenario-desc">{s.description}</span>
            </button>
          ))}
          <Link to="/donnees" className="cta-button prev-sim-cta">
            Explorer les prévisions →
          </Link>
        </div>
      </div>
    </section>
  );
}