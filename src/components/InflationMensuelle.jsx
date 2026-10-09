// Inflation mensuelle en glissement annuel (FMI, indices des prix à la consommation),
// pays par pays. Complète la série annuelle de la BCEAO, sans s'y substituer :
// la concordance des moyennes annuelles avec la BCEAO est affichée en note.
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from "recharts";
import { INFLATION_MENSUELLE, glissement } from "../data/fmi.js";
import { fmtMois, fmtValeur } from "../lib/format.js";
import { useMouvementReduit } from "../lib/mouvement.js";
import Fondu from "./Fondu.jsx";

const AXE = { fontFamily: "Source Sans 3", fontSize: 11, fill: "#7a6f66" };
const SEUIL = 3;

function Infobulle({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { mois, valeur } = payload[0].payload;
  return (
    <div className="infobulle">
      <b>{fmtMois(mois)}</b>
      <span><em className="nombre">{fmtValeur(valeur, "%")}</em></span>
    </div>
  );
}

function Courbe({ zone, depuis }) {
  const { t } = useTranslation();
  const reduit = useMouvementReduit();
  const points = INFLATION_MENSUELLE.pays[zone]?.points || [];
  // Mois manquants : trou dans la courbe plutôt qu'une ligne tirée entre deux mois éloignés.
  const data = [];
  for (const [mois, valeur] of points.filter(([m]) => m >= depuis)) {
    const prec = data.at(-1);
    if (prec) {
      const [a, m] = prec.mois.split("-").map(Number);
      const suivant = m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, "0")}`;
      if (suivant !== mois) data.push({ mois: suivant, valeur: null });
    }
    data.push({ mois, valeur });
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid vertical={false} stroke="#e1d4bf" />
        <XAxis dataKey="mois" tick={AXE} tickFormatter={(m) => m.slice(0, 4)} interval={11} tickLine={false} axisLine={{ stroke: "#b9ab95" }} />
        <YAxis tick={AXE} width={36} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
        <ReferenceLine y={0} stroke="#b9ab95" />
        <ReferenceLine y={SEUIL} stroke="#b8502a" strokeDasharray="4 3" label={{ value: t("im_seuil"), position: "insideTopLeft", fill: "#b8502a", fontSize: 11, fontFamily: "Source Sans 3" }} />
        <Tooltip content={<Infobulle />} cursor={{ stroke: "#b9ab95" }} />
        <Line dataKey="valeur" stroke="#263a7a" strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={!reduit} animationDuration={500} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Notes de lecture et de source, avec la concordance FMI / BCEAO. */
function Notes({ zones }) {
  const { t } = useTranslation();
  const conc = zones.map((z) => INFLATION_MENSUELLE.pays[z]?.concordance?.[0]).filter(Boolean);
  const annee = conc.length ? Math.max(...conc.map((c) => c.annee)) : null;
  const ecart = conc.filter((c) => c.annee === annee).reduce((m, c) => Math.max(m, Math.abs(c.ecart)), 0);
  return (
    <dl className="visu-notes">
      <div>
        <dt>{t("note_lecture")}</dt>
        <dd>{t("im_lecture")}</dd>
      </div>
      {annee && (
        <div>
          <dt>{t("im_concordance_titre")}</dt>
          <dd>{t("im_concordance", { annee, ecart: fmtValeur(ecart, "points de %") })}</dd>
        </div>
      )}
      <div>
        <dt>{t("note_source")}</dt>
        <dd>{t("im_source", { mois: fmtMois(zones.length === 1 ? INFLATION_MENSUELLE.pays[zones[0]].dernier_mois : INFLATION_MENSUELLE.dernier_mois) })}</dd>
      </div>
    </dl>
  );
}

/** zone : un seul pays (profil) ; sinon tableau des huit pays et courbe du pays choisi. */
export default function InflationMensuelle({ zone = null, depuis = "2019-01" }) {
  const { t } = useTranslation();
  const zones = Object.keys(INFLATION_MENSUELLE.pays);
  const lignes = zones.map((z) => ({ z, ...glissement(z) })).sort((a, b) => b.valeur - a.valeur);
  const [choix, setChoix] = useState(lignes[0]?.z);
  const actif = zone || choix;
  if (!INFLATION_MENSUELLE.pays[actif]) return null;
  const dernier = glissement(actif);

  return (
    <section className="visu">
      <div className="visu-tete">
        <div>
          <h2>{zone ? t("im_titre_pays", { pays: t(`zone_${zone}`) }) : t("im_titre")}</h2>
          <p>
            {zone
              ? t("im_sous_titre", { mois: fmtMois(dernier.mois), v: fmtValeur(dernier.valeur, "%") })
              : t("im_sous_titre_pays", { n: zones.length, mois: fmtMois(INFLATION_MENSUELLE.dernier_mois) })}
          </p>
        </div>
      </div>
      <div className={zone ? "visu-corps" : "visu-corps im-grille"}>
        {!zone && (
          <div className="defilant">
            <table className="tableau im-tableau">
              <thead>
                <tr>
                  <th scope="col">{t("col_pays")}</th>
                  <th scope="col" className="num">{t("im_col_dernier")}</th>
                  <th scope="col" className="num">{t("im_col_un_an")}</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.z} className={l.z === actif ? "im-actif" : undefined}>
                    <th scope="row">
                      <button type="button" className="im-choix" aria-pressed={l.z === actif} onClick={() => setChoix(l.z)}>
                        {t(`zone_${l.z}`)}
                      </button>
                      <small>{fmtMois(l.mois)}</small>
                    </th>
                    <td className={`num nombre${l.valeur > SEUIL ? " critere-ko" : ""}`}>{fmtValeur(l.valeur, "%")}</td>
                    <td className="num nombre">{l.unAn != null ? fmtValeur(l.unAn, "%") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div>
          {!zone && <p className="im-legende">{t("im_courbe", { pays: t(`zone_${actif}`) })} · <Link to={`/pays/${actif}`}>{t("im_profil")}</Link></p>}
          <Fondu cle={actif}>
            <Courbe zone={actif} depuis={depuis} />
          </Fondu>
        </div>
      </div>
      <Notes zones={zone ? [zone] : zones} />
    </section>
  );
}
