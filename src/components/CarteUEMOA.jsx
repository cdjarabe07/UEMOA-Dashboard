// Carte des huit pays de l'UEMOA (Natural Earth, domaine public : voir
// scripts/generer_carte_uemoa.py). Sans valeurs : carte de situation ;
// avec valeurs : carte choroplèthe en 5 classes égales entre min et max.
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import carte from "../data/carte_uemoa.json";
import { fmtCourt } from "../lib/format.js";

export const RAMPE = ["#e3e6f0", "#b9c1db", "#8c99c0", "#5c6ca1", "#24346b"];

// Décalage des étiquettes (pixels de la carte) pour les petits pays et le littoral.
const DECALAGE = { guinee_bissau: [-30, 52], togo: [-4, 70], benin: [26, 40], senegal: [-24, -6], cote_ivoire: [0, 6], mali: [10, 40] };
const COURT = { guinee_bissau: "zone_court_guinee_bissau", cote_ivoire: "zone_court_cote_ivoire", burkina: "zone_court_burkina" };

export const classeDe = (v, min, max) => (v == null ? null : Math.min(4, Math.floor(((v - min) / (max - min || 1)) * 5)));

/**
 * valeurs = { zoneId: nombre } (optionnel), unite = unité des valeurs,
 * survol / setSurvol = pays mis en évidence (partagé avec une liste).
 */
export default function CarteUEMOA({ valeurs = null, unite = null, survol = null, setSurvol = () => {}, label }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const nums = valeurs ? Object.values(valeurs).filter((v) => v != null) : [];
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const ouvrir = (z) => navigate(`/pays/${z}`);

  return (
    <svg className={`carte-uemoa${valeurs ? " carte-uemoa--valeurs" : ""}`} viewBox={carte.vue.join(" ")} role="group" aria-label={label}>
      {Object.entries(carte.voisins).map(([iso, d]) => (
        <path key={iso} className="carte-voisin" d={d} aria-hidden="true" />
      ))}
      {Object.entries(carte.pays).map(([z, d]) => {
        const v = valeurs?.[z];
        const k = valeurs ? classeDe(v, min, max) : null;
        const nom = t(`zone_${z}`);
        return (
          <path
            key={z}
            d={d}
            className={`carte-uemoa-pays${survol === z ? " actif" : ""}${valeurs && v == null ? " sans-valeur" : ""}`}
            style={valeurs && k != null ? { fill: RAMPE[k] } : undefined}
            tabIndex={0}
            role="link"
            aria-label={valeurs ? `${nom} : ${v == null ? t("nd") : fmtCourt(v, unite)}` : nom}
            onMouseEnter={() => setSurvol(z)}
            onMouseLeave={() => setSurvol(null)}
            onFocus={() => setSurvol(z)}
            onBlur={() => setSurvol(null)}
            onClick={() => ouvrir(z)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), ouvrir(z))}
          >
            <title>{nom}</title>
          </path>
        );
      })}
      {Object.entries(carte.etiquettes).map(([z, [x, y]]) => {
        const [dx, dy] = DECALAGE[z] || [0, 0];
        const v = valeurs?.[z];
        const fonce = valeurs && classeDe(v, min, max) >= 3;
        return (
          <text key={z} className={`carte-etiquette${fonce ? " clair" : ""}`} x={x + dx} y={y + dy} textAnchor="middle" aria-hidden="true">
            {COURT[z] ? t(COURT[z]) : t(`zone_${z}`)}
            {valeurs && (
              <tspan className="carte-valeur" x={x + dx} dy="27">
                {v == null ? t("nd") : fmtCourt(v, unite)}
              </tspan>
            )}
          </text>
        );
      })}
    </svg>
  );
}

/** Légende de la carte choroplèthe : bornes réelles et unité. */
export function LegendeCarte({ valeurs, unite, annee }) {
  const nums = Object.values(valeurs).filter((v) => v != null);
  return (
    <p className="carte-legende">
      <span className="nombre">{fmtCourt(Math.min(...nums), unite)}</span>
      {RAMPE.map((c) => (
        <i key={c} style={{ background: c }} aria-hidden="true" />
      ))}
      <span className="nombre">{fmtCourt(Math.max(...nums), unite)}</span>
      <span>· {annee}</span>
    </p>
  );
}

export const SOURCE_CARTE = carte.source;
