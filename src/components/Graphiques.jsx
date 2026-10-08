// Graphiques du portail (Recharts) : séries multi-pays, prévision, mini-courbe.
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { fmtNombre, fmtValeur, fmtIntervalle } from "../lib/format.js";

// Une couleur stable par pays ; l'Union est tracée en encre, en pointillés.
export const COULEUR_ZONE = {
  benin: "#d39b2a",
  burkina: "#5e7d3a",
  cote_ivoire: "#b8502a",
  guinee_bissau: "#7a3e6b",
  mali: "#2e7f7a",
  niger: "#8a5a3b",
  senegal: "#263a7a",
  togo: "#5b7db1",
  uemoa: "#1f1a17",
};

const AXE = { fontFamily: "Inter", fontSize: 11, fill: "#7a6f66" };
const GRILLE = "#e6dccb";

function Infobulle({ active, payload, label, unite, noms }) {
  // Le point intercalé à la rupture (année non entière) n'a pas d'infobulle.
  if (!active || !payload?.length || !Number.isInteger(label)) return null;
  const points = payload.filter((p) => p.value != null && !Array.isArray(p.value)).sort((a, b) => b.value - a.value);
  return (
    <div className="infobulle">
      <b>{label}</b>
      {points.map((p) => (
        <span key={p.dataKey}>
          <i style={{ background: p.stroke }} /> {noms[p.dataKey] || p.dataKey}
          <em className="nombre">{fmtValeur(p.value, unite)}</em>
        </span>
      ))}
    </div>
  );
}

/**
 * Séries annuelles de plusieurs zones : series = { zoneId: [{annee, valeur}] }.
 * seuil = { valeur, libelle } (ligne de référence), animer = tracé à l'entrée
 * puis transition au changement de données (désactivé si mouvement réduit).
 * rupture = première année d'un nouveau périmètre : le tracé s'interrompt et un
 * repère vertical la signale (valeurs inchangées).
 */
export function GraphiqueSeries({ series, unite, noms, hauteur = 340, zero = false, seuil = null, animer = false, rupture = null }) {
  const { t } = useTranslation();
  const annees = new Set();
  Object.values(series).forEach((s) => s.forEach((p) => annees.add(p.annee)));
  const data = [...annees]
    .sort((a, b) => a - b)
    .map((annee) => {
      const ligne = { annee };
      for (const [z, s] of Object.entries(series)) {
        const p = s.find((x) => x.annee === annee);
        ligne[z] = p ? p.valeur : null;
      }
      return ligne;
    });
  // Point vide intercalé avant la rupture : avec connectNulls={false}, la ligne s'interrompt.
  const avecRupture = rupture != null && data.some((d) => d.annee < rupture) && data.some((d) => d.annee >= rupture);
  if (avecRupture) {
    const i = data.findIndex((d) => d.annee >= rupture);
    data.splice(i, 0, { annee: rupture - 0.5 });
  }
  return (
    <ResponsiveContainer width="100%" height={hauteur}>
      <LineChart data={data} margin={{ top: avecRupture ? 22 : 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={GRILLE} vertical={false} />
        <XAxis dataKey="annee" type="number" domain={["dataMin", "dataMax"]} allowDecimals={false} tickCount={8} tick={AXE} axisLine={{ stroke: GRILLE }} tickLine={false} />
        <YAxis tick={AXE} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => fmtNombre(v)} />
        {zero && <ReferenceLine y={0} stroke="#b9ab95" />}
        {seuil && <ReferenceLine y={seuil.valeur} stroke="#b8502a" strokeWidth={1.5} strokeDasharray="2 3" ifOverflow="extendDomain" />}
        {avecRupture && (
          <ReferenceLine
            x={rupture - 0.5}
            stroke="#b8502a"
            strokeDasharray="4 3"
            label={{ value: t("rupture_graph", { annee: rupture }), position: "top", fill: "#b8502a", fontSize: 12, fontFamily: "Inter" }}
          />
        )}
        <Tooltip content={<Infobulle unite={unite} noms={noms} />} cursor={{ stroke: "#b9ab95" }} />
        {Object.keys(series).map((z) => (
          <Line
            key={z}
            dataKey={z}
            stroke={COULEUR_ZONE[z] || "#4a403a"}
            strokeWidth={z === "uemoa" ? 2.5 : 1.75}
            strokeDasharray={z === "uemoa" && Object.keys(series).length > 1 ? "6 4" : undefined}
            dot={false}
            connectNulls={false}
            isAnimationActive={animer}
            animationDuration={600}
            animationEasing="ease-out"
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Mini-courbe sans axes ; rupture = première année d'un nouveau périmètre (tracé interrompu). */
export function MiniCourbe({ points, couleur = "#263a7a", hauteur = 44, rupture = null }) {
  const i = rupture != null ? points.findIndex((p) => p.annee >= rupture) : -1;
  const data = i > 0 ? [...points.slice(0, i), { annee: rupture - 0.5, valeur: null }, ...points.slice(i)] : points;
  return (
    <ResponsiveContainer width="100%" height={hauteur}>
      <LineChart data={data} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
        <YAxis hide domain={["auto", "auto"]} />
        <Line dataKey="valeur" stroke={couleur} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Historique [{annee, valeur}] + prévisions (previsions.json) raccordées.
export function serieAvecPrevision(historique, previsions, depuis = null) {
  const lignes = new Map();
  for (const { annee, valeur } of historique) {
    if (depuis == null || annee >= depuis) lignes.set(annee, { annee, obs: valeur });
  }
  const dernier = historique[historique.length - 1];
  if (dernier && previsions.length) {
    lignes.set(dernier.annee, { ...lignes.get(dernier.annee), prev: dernier.valeur, ic: [dernier.valeur, dernier.valeur] });
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

function InfobullePrevision({ active, payload, label, unite }) {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  const l = payload[0].payload;
  return (
    <div className="infobulle">
      <b>{label}</b>
      {l.obs != null && <span>{t("leg_observe")} <em className="nombre">{fmtValeur(l.obs, unite)}</em></span>}
      {l.prev != null && l.obs == null && <span>{t("leg_prevision")} <em className="nombre">{fmtValeur(l.prev, unite)}</em></span>}
      {Array.isArray(l.ic) && l.ic[0] !== l.ic[1] && (
        <span>{t("leg_ic")} <em className="nombre">{fmtIntervalle(l.ic[0], l.ic[1], unite)}</em></span>
      )}
    </div>
  );
}

/** Historique + prévision + intervalle de confiance à 95 %. */
export function GraphiquePrevision({ data, unite, hauteur = 340 }) {
  const { t } = useTranslation();
  const avecPrevision = data.some((d) => d.prev != null);
  return (
    <div>
      <ResponsiveContainer width="100%" height={hauteur}>
        <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={GRILLE} vertical={false} />
          <XAxis dataKey="annee" type="number" domain={["dataMin", "dataMax"]} allowDecimals={false} tickCount={8} tick={AXE} axisLine={{ stroke: GRILLE }} tickLine={false} />
          <YAxis tick={AXE} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => fmtNombre(v)} />
          <Tooltip content={<InfobullePrevision unite={unite} />} cursor={{ stroke: "#b9ab95" }} />
          <Area dataKey="ic" stroke="none" fill="rgba(184,80,42,0.16)" connectNulls isAnimationActive={false} />
          <Line dataKey="obs" stroke="#263a7a" strokeWidth={2.25} dot={false} isAnimationActive={false} />
          <Line dataKey="prev" stroke="#b8502a" strokeWidth={2.25} strokeDasharray="6 4" dot={{ r: 3.5, fill: "#b8502a", stroke: "#b8502a" }} connectNulls isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="legende">
        <span><i style={{ background: "#263a7a" }} /> {t("leg_observe")}</span>
        {avecPrevision && (
          <>
            <span><i className="pointille" /> {t("leg_prevision")}</span>
            <span><i className="bande" /> {t("leg_ic")}</span>
          </>
        )}
      </p>
    </div>
  );
}

/**
 * Barres horizontales par pays (triées), avec repère de l'Union et seuil
 * optionnel (décrits dans une légende sous le graphique).
 * donnees = [{ id, nom, valeur }], union = valeur | null,
 * seuil = { valeur, libelle } | null, couleur = (d) => couleur de barre (optionnel).
 */
export function BarresPays({ donnees, unite, union, libelleUnion, seuil, couleur }) {
  const { t } = useTranslation();
  const lignes = donnees.filter((d) => d.valeur != null).sort((a, b) => b.valeur - a.valeur);
  const manquants = donnees.filter((d) => d.valeur == null);
  const hauteur = lignes.length * 40 + 30;
  const valeurs = [...lignes.map((l) => l.valeur), union ?? 0, seuil?.valeur ?? 0, 0];
  const min = Math.min(...valeurs);
  const max = Math.max(...valeurs);
  const marge = (max - min) * 0.14 || 1;
  // Bornes arrondies à une valeur « ronde » (1, 2, 2,5, 5 × 10^n) pour des graduations lisibles.
  const arrondi = (v) => {
    if (v <= 0) return 0;
    const p = 10 ** Math.floor(Math.log10(v));
    return [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((m) => m * p >= v) * p;
  };
  const domaine = [min < 0 ? -arrondi(-min + marge) : 0, max > 0 ? arrondi(max + marge) : 0];

  // Étiquette de valeur toujours à l'extérieur de la barre.
  const etiquette = ({ x, y, width, height, value }) => {
    const debut = Math.min(x, x + width);
    const fin = Math.max(x, x + width);
    const negatif = value < 0;
    return (
      <text
        x={negatif ? debut - 6 : fin + 6}
        y={y + height / 2}
        dy="0.35em"
        textAnchor={negatif ? "end" : "start"}
        fontSize={12}
        fontFamily="Inter"
        fill="#1f1a17"
      >
        {fmtValeur(value, unite, undefined, true)}
      </text>
    );
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={hauteur}>
        <BarChart data={lignes} layout="vertical" margin={{ top: 4, right: 44, bottom: 4, left: 8 }} barCategoryGap={10}>
          <CartesianGrid stroke={GRILLE} horizontal={false} />
          <XAxis type="number" domain={domaine} tick={AXE} axisLine={false} tickLine={false} tickFormatter={(v) => fmtNombre(v)} />
          <YAxis type="category" dataKey="nom" tick={{ ...AXE, fontSize: 13, fill: "#1f1a17" }} axisLine={false} tickLine={false} width={118} />
          <ReferenceLine x={0} stroke="#b9ab95" />
          {union != null && <ReferenceLine x={union} stroke="#1f1a17" strokeDasharray="5 4" strokeWidth={1.5} />}
          {seuil && <ReferenceLine x={seuil.valeur} stroke="#b8502a" strokeWidth={2} />}
          <Bar dataKey="valeur" isAnimationActive={false} radius={3} label={etiquette}>
            {lignes.map((l) => (
              <Cell key={l.id} fill={couleur ? couleur(l) : "#263a7a"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="legende">
        {union != null && (
          <span>
            <i className="pointille pointille--encre" /> {libelleUnion} : {fmtValeur(union, unite)}
          </span>
        )}
        {seuil && (
          <span>
            <i style={{ background: "#b8502a" }} /> {seuil.libelle}
          </span>
        )}
        {manquants.length > 0 && <span>{t("nd")} : {manquants.map((m) => m.nom).join(", ")}</span>}
      </p>
    </div>
  );
}
