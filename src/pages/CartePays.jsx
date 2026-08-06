import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
} from "recharts";

// NOTE : positions schématiques (pas un tracé géographique réel) —
// disposées pour évoquer la géographie relative de l'UEMOA, pas une carte précise.
const PAYS = [
  {
    id: "senegal",
    nom: "Sénégal",
    x: 8,
    y: 38,
    disponible: true,
    croissance: 4.1,
    inflation: 2.9,
    dette: 76.2,
    pib: "21 920 Mds FCFA",
    historique: [
      { annee: "2022", value: 19100 },
      { annee: "2023", value: 20050 },
      { annee: "2024", value: 20870 },
      { annee: "2025", value: 21400 },
      { annee: "2026", value: 21920 },
    ],
  },
  {
    id: "mali",
    nom: "Mali",
    x: 32,
    y: 22,
    disponible: true,
    croissance: 3.4,
    inflation: 3.8,
    dette: 52.1,
    pib: "13 450 Mds FCFA",
    historique: [
      { annee: "2022", value: 11800 },
      { annee: "2023", value: 12300 },
      { annee: "2024", value: 12750 },
      { annee: "2025", value: 13100 },
      { annee: "2026", value: 13450 },
    ],
  },
  {
    id: "burkina",
    nom: "Burkina Faso",
    x: 42,
    y: 40,
    disponible: true,
    croissance: 3.9,
    inflation: 2.1,
    dette: 58.7,
    pib: "9 870 Mds FCFA",
    historique: [
      { annee: "2022", value: 8600 },
      { annee: "2023", value: 9020 },
      { annee: "2024", value: 9380 },
      { annee: "2025", value: 9640 },
      { annee: "2026", value: 9870 },
    ],
  },
  {
    id: "cote_ivoire",
    nom: "Côte d'Ivoire",
    x: 28,
    y: 58,
    disponible: true,
    croissance: 6.2,
    inflation: 3.1,
    dette: 61.4,
    pib: "44 300 Mds FCFA",
    historique: [
      { annee: "2022", value: 37800 },
      { annee: "2023", value: 39900 },
      { annee: "2024", value: 41600 },
      { annee: "2025", value: 43000 },
      { annee: "2026", value: 44300 },
    ],
  },
  { id: "guinee_bissau", nom: "Guinée-Bissau", x: 2, y: 52, disponible: false },
  { id: "benin", nom: "Bénin", x: 55, y: 55, disponible: false },
  { id: "togo", nom: "Togo", x: 50, y: 60, disponible: false },
  { id: "niger", nom: "Niger", x: 58, y: 25, disponible: false },
];

export default function CartePays() {
  const [paysActifId, setPaysActifId] = useState("senegal");
  const paysActif = PAYS.find((p) => p.id === paysActifId);

  return (
    <section className="carte-pays-section">
      <h2 className="dynamic-section-title">Explorer les pays de l'UEMOA</h2>
      <div className="carte-pays-layout">
        <div className="carte-pays-svg-wrapper">
          <svg viewBox="0 0 70 70" className="carte-pays-svg">
            <rect x="0" y="0" width="70" height="70" rx="6" fill="#f0f2f5" />
            {PAYS.map((p) => (
              <g
                key={p.id}
                onClick={() => p.disponible && setPaysActifId(p.id)}
                style={{ cursor: p.disponible ? "pointer" : "default" }}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={paysActifId === p.id ? 4.2 : 3.2}
                  fill={
                    !p.disponible
                      ? "#d1d5db"
                      : paysActifId === p.id
                      ? "#c9a227"
                      : "#1d4ed8"
                  }
                  opacity={p.disponible ? 1 : 0.6}
                  className="carte-pays-point"
                />
                <text
                  x={p.x}
                  y={p.y - 5}
                  fontSize="2.6"
                  textAnchor="middle"
                  fill="#374151"
                  fontFamily="IBM Plex Sans, sans-serif"
                >
                  {p.nom}
                </text>
              </g>
            ))}
          </svg>
          <p className="carte-pays-note">
            Carte schématique — les 4 pays en gris seront ajoutés prochainement.
          </p>
        </div>

        <div className="carte-pays-panel">
          {paysActif.disponible ? (
            <>
              <h3 className="carte-pays-panel-titre">{paysActif.nom}</h3>
              <div className="carte-pays-indicateurs">
                <div className="carte-pays-indicateur">
                  <span className="carte-pays-indicateur-label">Croissance</span>
                  <span className="carte-pays-indicateur-valeur">{paysActif.croissance}%</span>
                </div>
                <div className="carte-pays-indicateur">
                  <span className="carte-pays-indicateur-label">Inflation</span>
                  <span className="carte-pays-indicateur-valeur">{paysActif.inflation}%</span>
                </div>
                <div className="carte-pays-indicateur">
                  <span className="carte-pays-indicateur-label">Dette / PIB</span>
                  <span className="carte-pays-indicateur-valeur">{paysActif.dette}%</span>
                </div>
                <div className="carte-pays-indicateur">
                  <span className="carte-pays-indicateur-label">PIB</span>
                  <span className="carte-pays-indicateur-valeur">{paysActif.pib}</span>
                </div>
              </div>
              <div className="carte-pays-graphique">
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={paysActif.historique}>
                    <XAxis dataKey="annee" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#1d4ed8" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <p className="carte-pays-indisponible">Données à venir pour ce pays.</p>
          )}
        </div>
      </div>
    </section>
  );
}