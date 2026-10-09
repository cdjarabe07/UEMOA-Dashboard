// Prix mensuels des matières premières (FMI, PCPS) : un petit graphique par produit,
// avec dernière valeur, variation sur 12 mois et pays concernés.
import { useTranslation } from "react-i18next";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { PRODUITS, MATIERES, resumePrix } from "../data/fmi.js";
import { fmtMois, fmtNombre, fmtVariation } from "../lib/format.js";
import { useMouvementReduit } from "../lib/mouvement.js";

export { fmtMois };

const AXE = { fontFamily: "Source Sans 3", fontSize: 10, fill: "#7a6f66" };

function Infobulle({ active, payload, unite }) {
  if (!active || !payload?.length) return null;
  const { mois, valeur } = payload[0].payload;
  return (
    <div className="infobulle">
      <b>{fmtMois(mois)}</b>
      <span>
        <em className="nombre">{fmtNombre(valeur, valeur < 100 ? 1 : 0)} {unite}</em>
      </span>
    </div>
  );
}

/** depuis = premier mois affiché (AAAA-MM) ; produits = liste d'identifiants (tous par défaut). */
export default function MatieresPremieres({ depuis = "2019-01", produits = null }) {
  const { t } = useTranslation();
  const reduit = useMouvementReduit();
  const liste = produits ? PRODUITS.filter((p) => produits.includes(p.id)) : PRODUITS;
  return (
    <ul className="mp-grille">
      {liste.map((p) => {
        const r = resumePrix(p);
        const unite = t(`mp_unite_${p.id}`);
        const data = p.points.filter(([m]) => m >= depuis).map(([mois, valeur]) => ({ mois, valeur }));
        return (
          <li key={p.id} className="mp-carte">
            <p className="mp-nom">{t(`mp_${p.id}`)}</p>
            <p className="mp-valeur nombre">
              {fmtNombre(r.valeur, r.valeur < 100 ? 1 : 0)} <span>{unite}</span>
            </p>
            <p className="mp-variation nombre">
              {r.variation12 != null && t("mp_variation", { v: fmtVariation(r.variation12, "%"), mois: fmtMois(r.mois) })}
            </p>
            <div className="mp-graphique">
              <ResponsiveContainer width="100%" height={90}>
                <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <XAxis dataKey="mois" hide />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip content={<Infobulle unite={unite} />} cursor={{ stroke: "#b9ab95" }} />
                  <Line dataKey="valeur" stroke="#263a7a" strokeWidth={1.75} dot={false} isAnimationActive={!reduit} animationDuration={600} />
                </LineChart>
              </ResponsiveContainer>
              <p className="mp-bornes nombre" style={AXE}>
                <span>{data[0]?.mois.slice(0, 4)}</span>
                <span>{data.at(-1)?.mois.slice(0, 4)}</span>
              </p>
            </div>
            {p.zones.length > 0 ? (
              <p className="mp-pays">{t("mp_suivi_pour", { pays: p.zones.map((z) => t(`zone_${z}`)).join(", ") })}</p>
            ) : (
              <p className="mp-pays">{t("mp_importation")}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function NoteMatieres() {
  const { t } = useTranslation();
  return (
    <p className="note">
      {t("mp_source", { mois: fmtMois(MATIERES.dernier_mois) })}{" "}
      <a href={MATIERES.url_unites} target="_blank" rel="noreferrer">{t("mp_unites_lien")}</a>
    </p>
  );
}
