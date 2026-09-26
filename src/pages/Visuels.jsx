// Éléments visuels partagés (identité de l'observatoire : panneau navy,
// courbes or, tampon de précision). Aucune valeur économique ici :
// tout est calculé à partir des séries passées en paramètre.
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import metaData from "../data/meta.json";

export const COULEURS = {
  navy: "#0f1b2d",
  surface: "#16283f",
  gold: "#c9a227",
  goldSoft: "#e0c25f",
  cream: "#ede9df",
  muted: "#93a1b8",
  teal: "#3e8e7e",
  grid: "rgba(237, 233, 223, 0.08)",
};

// Couleurs des séries pays sur fond navy.
export const COULEURS_PAYS = ["#e0c25f", "#5fb3a1", "#8fb4ff", "#e58f6b", "#c4a7e7"];

export const fmt0 = (v) => v.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
export const fmt1 = (v) => v.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
export const fmt2 = (v) => v.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
export const fmtV = (v, unite) => (unite === "%" ? `${fmt1(v)} %` : `${fmt0(v)} ${unite}`);
export const anneeDe = (period) => parseInt(period.slice(0, 4), 10);

// Date de dernière génération des données (meta.json — aucune date inventée).
export const DATE_MAJ = (() => {
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

// Libellé traduit d'un indicateur (clé i18n "ind_<id>").
export const nomIndicateur = (t, id) => t(`ind_${id}`, { defaultValue: id });

// Fusionne historique ({period, value}) et prévisions (previsions.json) en une
// série annuelle : obs, prev (raccordée à la dernière observation) et ic [bas, haut].
export function construireSerie(historique = [], previsions = [], depuis = null) {
  const lignes = new Map();
  for (const { period, value } of historique) {
    const annee = anneeDe(period);
    if (depuis != null && annee < depuis) continue;
    lignes.set(annee, { annee, obs: value });
  }
  if (previsions.length && historique.length) {
    const dernier = historique[historique.length - 1];
    const annee = anneeDe(dernier.period);
    lignes.set(annee, { ...lignes.get(annee), annee, prev: dernier.value, ic: [dernier.value, dernier.value] });
  }
  for (const p of previsions) {
    lignes.set(p.annee, {
      annee: p.annee,
      prev: p.valeur_prevue,
      ic: p.borne_basse != null && p.borne_haute != null ? [p.borne_basse, p.borne_haute] : undefined,
    });
  }
  return [...lignes.values()].sort((a, b) => a.annee - b.annee);
}

function TooltipSombre({ active, payload, label, unite, libelles }) {
  if (!active || !payload || !payload.length) return null;
  const ligne = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-annee">{label}</div>
      {ligne.obs != null && (
        <div>
          <span className="chart-tooltip-key">{libelles.obs}</span> {fmtV(ligne.obs, unite)}
        </div>
      )}
      {ligne.prev != null && ligne.obs == null && (
        <div>
          <span className="chart-tooltip-key">{libelles.prev}</span> {fmtV(ligne.prev, unite)}
        </div>
      )}
      {Array.isArray(ligne.ic) && ligne.ic[0] !== ligne.ic[1] && (
        <div className="chart-tooltip-ic">
          {libelles.ic} : {fmtV(ligne.ic[0], unite)} – {fmtV(ligne.ic[1], unite)}
        </div>
      )}
    </div>
  );
}

// Graphique principal sur panneau navy : observations (or), prévisions
// (pointillés crème) et intervalle de confiance à 95 % (bande).
export function GraphiquePrevision({ data, unite, libelles, height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="grad-obs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COULEURS.gold} stopOpacity={0.28} />
            <stop offset="100%" stopColor={COULEURS.gold} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={COULEURS.grid} vertical={false} />
        <XAxis
          dataKey="annee"
          type="number"
          domain={["dataMin", "dataMax"]}
          allowDecimals={false}
          tickCount={8}
          stroke={COULEURS.muted}
          tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: COULEURS.muted }}
          axisLine={{ stroke: "rgba(237,233,223,0.18)" }}
          tickLine={false}
        />
        <YAxis
          stroke={COULEURS.muted}
          tick={{ fontFamily: "IBM Plex Mono", fontSize: 11, fill: COULEURS.muted }}
          axisLine={false}
          tickLine={false}
          width={64}
          tickFormatter={fmt0}
        />
        <Tooltip
          content={<TooltipSombre unite={unite} libelles={libelles} />}
          cursor={{ stroke: "rgba(237,233,223,0.25)" }}
        />
        <Area
          type="monotone"
          dataKey="ic"
          stroke="none"
          fill={COULEURS.teal}
          fillOpacity={0.35}
          connectNulls
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="obs"
          stroke={COULEURS.gold}
          strokeWidth={2}
          fill="url(#grad-obs)"
          dot={false}
          activeDot={{ r: 4, fill: COULEURS.goldSoft, stroke: COULEURS.navy }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="prev"
          stroke={COULEURS.cream}
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={{ r: 3.5, fill: COULEURS.cream, stroke: COULEURS.navy }}
          connectNulls
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function LegendePrevision({ libelles, avecPrevision = true }) {
  return (
    <div className="chart-legend chart-legend--dark">
      <span><i className="key key-obs" /> {libelles.obs}</span>
      {avecPrevision && (
        <>
          <span><i className="key key-prev" /> {libelles.prev}</span>
          <span><i className="key key-ic" /> {libelles.ic}</span>
        </>
      )}
    </div>
  );
}

// Tampon circulaire de précision (élément signature de l'ancienne page Données).
export function TamponMAE({ mae, ordre, kicker, caption }) {
  return (
    <div className="stamp" aria-label={`${kicker} ${mae}`}>
      <span className="stamp-kicker">{kicker}</span>
      <span className="stamp-value">{fmt2(mae)}</span>
      <span className="stamp-caption">{caption}</span>
      {ordre && <span className="stamp-order">SARIMA {ordre}</span>}
    </div>
  );
}

// Bandeau d'en-tête des pages internes (reprend le hero de l'accueil).
export function BandeauPage({ eyebrow, titre, sous, meta = [] }) {
  return (
    <header className="page-banner">
      <div className="page-banner-inner">
        <p className="page-banner-eyebrow">{eyebrow}</p>
        <h1 className="page-banner-title">{titre}</h1>
        <div className="hero-divider" />
        {sous && <p className="page-banner-sub">{sous}</p>}
        {meta.length > 0 && (
          <div className="page-banner-meta">
            {meta.filter(Boolean).map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
