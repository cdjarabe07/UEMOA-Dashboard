import { Link } from "react-router-dom";
import { MiniCourbe } from "./Graphiques.jsx";

/**
 * Tableau « Indicateur | Valeur la plus récente | (comparaison) | Tendance ».
 * lignes = [{ id, libelle, unite, lien, valeur, annee, comparaison, points }]
 * colonnes = { valeur, comparaison?, tendance }  (en-têtes)
 */
export default function TableauIndicateurs({ titre, lignes, colonnes, couleur = "#263a7a" }) {
  return (
    <section className="tab-ind">
      {titre && <h3 className="tab-ind-titre">{titre}</h3>}
      <div className="defilant">
        <table className="tableau tableau--aere">
          <thead>
            <tr>
              <th scope="col">{colonnes.indicateur}</th>
              <th scope="col" className="num">{colonnes.valeur}</th>
              {colonnes.comparaison && <th scope="col" className="num">{colonnes.comparaison}</th>}
              <th scope="col" className="tab-ind-tendance">{colonnes.tendance}</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={l.id}>
                <th scope="row">
                  {l.lien ? <Link to={l.lien}>{l.libelle}</Link> : l.libelle}
                  <small>{l.unite}</small>
                </th>
                <td className="num">
                  <b className="tab-ind-valeur nombre">{l.valeur}</b>
                  <small className="nombre">{l.annee}</small>
                </td>
                {colonnes.comparaison && <td className="num nombre tab-ind-comparaison">{l.comparaison}</td>}
                <td className="tab-ind-tendance">
                  {l.points.length > 1 ? (
                    <>
                      <MiniCourbe points={l.points} couleur={couleur} hauteur={38} rupture={l.rupture} />
                      <span className="tab-ind-bornes nombre">
                        <span>{l.points[0].annee}</span>
                        <span>{l.points[l.points.length - 1].annee}</span>
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
