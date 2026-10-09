// Projections du FMI (WEO) : tableau pays × années, pour un indicateur choisi.
// Présentées à part des séries BCEAO et des prévisions de l'Observatoire.
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PAYS } from "../data/portail.js";
import { PROJECTIONS, ANNEES_PROJECTION, projection } from "../data/fmi.js";
import { fmtCourt, fmtMois, libelleUnite } from "../lib/format.js";

/** zones = liste de pays (tous par défaut) ; compact = 3 premières années seulement. */
export default function ProjectionsFMI({ zones = null, compact = false }) {
  const { t } = useTranslation();
  const [ind, setInd] = useState(PROJECTIONS.indicateurs[0].id);
  const meta = PROJECTIONS.indicateurs.find((i) => i.id === ind);
  const annees = compact ? ANNEES_PROJECTION.slice(0, 3) : ANNEES_PROJECTION;
  const lignes = (zones || PAYS.map((p) => p.id)).filter((z) => PROJECTIONS.series[ind]?.[z]);

  if (compact) {
    // Profil pays : tous les indicateurs pour un pays, années en colonnes.
    const z = lignes[0] || zones?.[0];
    return (
      <div className="defilant">
        <table className="tableau tableau-bm">
          <thead>
            <tr>
              <th scope="col">{t("col_indicateur")}</th>
              {annees.map((a) => <th key={a} scope="col" className="num nombre">{a}</th>)}
            </tr>
          </thead>
          <tbody>
            {PROJECTIONS.indicateurs.map((i) => (
              <tr key={i.id}>
                <th scope="row">
                  {t(`fmi_${i.id}`)}
                  <small>{libelleUnite(i.unite)}</small>
                </th>
                {annees.map((a) => <td key={a} className="num nombre">{fmtCourt(projection(i.id, z, a), i.unite)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section className="visu">
      <div className="visu-tete">
        <div>
          <h2>{t("fmi_titre", { edition: fmtMois(PROJECTIONS.edition) })}</h2>
          <p>{t(`fmi_${ind}`)} · {libelleUnite(meta.unite)}</p>
        </div>
        <div className="visu-outils">
          <div className="bascule" role="group" aria-label={t("col_indicateur")}>
            {PROJECTIONS.indicateurs.map((i) => (
              <button key={i.id} type="button" aria-pressed={i.id === ind} onClick={() => setInd(i.id)}>
                {t(`fmi_court_${i.id}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="visu-corps defilant">
        <table className="tableau" key={ind}>
          <thead>
            <tr>
              <th scope="col">{t("col_pays")}</th>
              {annees.map((a) => <th key={a} scope="col" className="num nombre">{a}</th>)}
            </tr>
          </thead>
          <tbody>
            {lignes.map((z) => (
              <tr key={z}>
                <th scope="row"><Link to={`/pays/${z}`}>{t(`zone_${z}`)}</Link></th>
                {annees.map((a) => <td key={a} className="num nombre">{fmtCourt(projection(ind, z, a), meta.unite)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="visu-notes">
        <div>
          <dt>{t("note_lecture")}</dt>
          <dd>{t("fmi_lecture")}</dd>
        </div>
        <div>
          <dt>{t("note_source")}</dt>
          <dd>{PROJECTIONS.source}.</dd>
        </div>
      </dl>
    </section>
  );
}
