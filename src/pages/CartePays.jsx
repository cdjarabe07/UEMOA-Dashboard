import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
} from "recharts";
import { useTranslation } from "react-i18next";
import comparaisonData from "../data/comparaison_pays.json";

// NOTE : positions schématiques (pas un tracé géographique réel) —
// disposées pour évoquer la géographie relative de l'UEMOA, pas une carte précise.

// Seules la géométrie et la disponibilité restent déclarées ici.
// Toutes les valeurs affichées proviennent de comparaison_pays.json (source de vérité).
const PAYS = [
  { id: "senegal", nom: "Sénégal", x: 8, y: 38, disponible: true },
  { id: "mali", nom: "Mali", x: 32, y: 22, disponible: true },
  { id: "burkina", nom: "Burkina Faso", x: 42, y: 40, disponible: true },
  { id: "cote_ivoire", nom: "Côte d'Ivoire", x: 28, y: 58, disponible: true },
  { id: "guinee_bissau", nom: "Guinée-Bissau", x: 2, y: 52, disponible: false },
  { id: "benin", nom: "Bénin", x: 55, y: 55, disponible: false },
  { id: "togo", nom: "Togo", x: 50, y: 60, disponible: false },
  { id: "niger", nom: "Niger", x: 58, y: 25, disponible: false },
];

// ---- Accès aux données réelles (comparaison_pays.json) ---------------------
// On ignore les observations sans valeur (ex. inflation du Sénégal avant 1998).
const serie = (nomPays, indicateur) =>
  comparaisonData
    .filter((r) => r.pays === nomPays && r.indicateur === indicateur && r.valeur != null)
    .sort((a, b) => a.annee.localeCompare(b.annee));

const derniereObservation = (s) => (s.length ? s[s.length - 1] : null);

function formatMilliards(v) {
  return `${v.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mds FCFA`;
}

function formatPct(v) {
  return `${v.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
}

export default function CartePays() {
  const { t } = useTranslation();
  const [paysActifId, setPaysActifId] = useState("senegal");
  const paysActif = PAYS.find((p) => p.id === paysActifId);

  const pibSerie = paysActif.disponible ? serie(paysActif.nom, "pib") : [];
  const inflSerie = paysActif.disponible ? serie(paysActif.nom, "inflation") : [];
  const dernierPib = derniereObservation(pibSerie);
  const derniereInfl = derniereObservation(inflSerie);

  // Année de référence : période la plus récente disponible pour ce pays.
  const anneeRef = [dernierPib, derniereInfl]
    .filter((o) => o != null)
    .map((o) => parseInt(o.annee.slice(0, 4), 10))
    .reduce((max, a) => (a > max ? a : max), 0);

  // Croissance du PIB calculée sur les deux dernières observations réelles.
  const croissance =
    pibSerie.length >= 2
      ? ((pibSerie[pibSerie.length - 1].valeur - pibSerie[pibSerie.length - 2].valeur) /
         pibSerie[pibSerie.length - 2].valeur) * 100
      : null;

  const historiquePib = pibSerie.map((r) => ({
    annee: parseInt(r.annee.slice(0, 4), 10),
    value: r.valeur,
  }));

  return (
    <section className="carte-pays-section">
      <h2 className="dynamic-section-title">{t("comparer_titre")}</h2>
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
          <p className="carte-pays-note">{t("comparer_note")}</p>
        </div>

        <div className="carte-pays-panel">
          {paysActif.disponible ? (
            <>
              <h3 className="carte-pays-panel-titre">{paysActif.nom}</h3>
              <div className="carte-pays-indicateurs">
                <div className="carte-pays-indicateur">
                  <span className="carte-pays-indicateur-label">{t("comparer_annee")}</span>
                  <span className="carte-pays-indicateur-valeur">
                    {anneeRef ? anneeRef : t("comparer_nd")}
                  </span>
                </div>
                <div className="carte-pays-indicateur">
                  <span className="carte-pays-indicateur-label">{t("comparer_pib")}</span>
                  <span className="carte-pays-indicateur-valeur">
                    {dernierPib ? formatMilliards(dernierPib.valeur) : t("comparer_nd")}
                  </span>
                </div>
                <div className="carte-pays-indicateur">
                  <span className="carte-pays-indicateur-label">{t("comparer_inflation")}</span>
                  <span className="carte-pays-indicateur-valeur">
                    {derniereInfl ? formatPct(derniereInfl.valeur) : t("comparer_nd")}
                  </span>
                </div>
                <div className="carte-pays-indicateur">
                  <span className="carte-pays-indicateur-label">{t("comparer_croissance")}</span>
                  <span className="carte-pays-indicateur-valeur">
                    {croissance != null ? formatPct(croissance) : t("comparer_nd")}
                  </span>
                </div>
              </div>
              {historiquePib.length > 1 && (
                <div className="carte-pays-graphique">
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={historiquePib}>
                      <XAxis dataKey="annee" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#1d4ed8" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="carte-pays-chart-caption">{t("comparer_chart_caption")}</p>
                </div>
              )}
            </>
          ) : (
            <p className="carte-pays-indisponible">{t("comparer_indisponible")}</p>
          )}
        </div>
      </div>
    </section>
  );
}