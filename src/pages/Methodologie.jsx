import { Link } from "react-router-dom";
import Bandeau from "../components/Bandeau.jsx";
import { useTranslation } from "react-i18next";
import { INDICATEURS as REGIONAUX, PAYS, SOURCE } from "../data/portail.js";
import { INDICATEURS as PREVISIONNELS } from "../data/catalogue.js";
import { CRITERES } from "../lib/convergence.js";
import { SEUIL_VARIATION } from "../lib/signaux.js";
import { DATE_GENERATION } from "../lib/meta.js";
import { fmtDate, fmtNombre, fmtPeriode, libelleUnite } from "../lib/format.js";

const SECTIONS = ["sources", "preparation", "indicateurs", "convergence", "previsions", "signaux", "limites"];

export default function Methodologie() {
  const { t } = useTranslation();
  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { label: t("nav_methodologie") }]}
        surtitre={t("meth_surtitre")}
        titre={t("meth_titre")}
        sousTitre={t("meth_chapeau")}
        meta={[
          { label: t("meta_source"), valeur: "BCEAO · DBnomics" },
          { label: t("meta_maj"), valeur: DATE_GENERATION ? fmtDate(DATE_GENERATION) : "—" },
        ]}
      />

      <div className="conteneur meth section">
        <nav className="meth-sommaire" aria-label={t("meth_sommaire")}>
          <p className="surtitre">{t("meth_sommaire")}</p>
          <ol>
            {SECTIONS.map((s) => (
              <li key={s}>
                <a href={`#${s}`}>{t(`meth_${s}_titre`)}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="meth-corps">
          <section id="sources">
            <h2>{t("meth_sources_titre")}</h2>
            <p>{t("meth_sources_p1", { n: PAYS.length })}</p>
            <p>
              {t("meth_sources_p2")} <code>{SOURCE}</code>.{" "}
              {DATE_GENERATION && t("meth_sources_date", { date: fmtDate(DATE_GENERATION) })}
            </p>
          </section>

          <section id="preparation">
            <h2>{t("meth_preparation_titre")}</h2>
            <p>{t("meth_preparation_p1")}</p>
            <ul>
              <li>{t("meth_preparation_l1")}</li>
              <li>{t("meth_preparation_l2")}</li>
              <li>{t("meth_preparation_l3")}</li>
            </ul>
          </section>

          <section id="indicateurs">
            <h2>{t("meth_indicateurs_titre")}</h2>
            <div className="defilant">
              <table className="tableau">
                <thead>
                  <tr>
                    <th scope="col">{t("col_indicateur")}</th>
                    <th scope="col">{t("meta_unite")}</th>
                    <th scope="col">{t("meta_periode")}</th>
                    <th scope="col">{t("meta_source")}</th>
                  </tr>
                </thead>
                <tbody>
                  {REGIONAUX.map((i) => (
                    <tr key={i.id}>
                      <th scope="row"><Link to={`/indicateurs/${i.id}`}>{t(i.libelle)}</Link></th>
                      <td>{libelleUnite(i.unite)}</td>
                      <td className="nombre">{fmtPeriode(i.periode)}</td>
                      <td><code>{i.serie_bceao}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="convergence">
            <h2>{t("meth_convergence_titre")}</h2>
            <p>{t("meth_convergence_p1")}</p>
            <ul>
              {CRITERES.map((c) => (
                <li key={c.id}>
                  <b>{t(`conv_${c.id}`)}</b> {t(`conv_${c.id}_seuil`)} — {t(c.rang === 1 ? "meth_rang1" : "meth_rang2")}
                </li>
              ))}
            </ul>
            <p>{t("meth_convergence_p2")}</p>
          </section>

          <section id="previsions">
            <h2>{t("meth_previsions_titre")}</h2>
            <p>{t("meth_previsions_p1")}</p>
            <div className="defilant">
              <table className="tableau">
                <thead>
                  <tr>
                    <th scope="col">{t("col_indicateur")}</th>
                    <th scope="col">{t("prev_modele")}</th>
                    <th scope="col" className="num">{t("prev_mae")}</th>
                    <th scope="col">{t("meth_statut")}</th>
                  </tr>
                </thead>
                <tbody>
                  {PREVISIONNELS.map((i) => (
                    <tr key={i.id}>
                      <th scope="row">{t(i.libelle)}</th>
                      <td>{i.modele ? `${i.modele.type} ${i.modele.ordre}` : t("prev_modele_nd")}</td>
                      <td className="num nombre">{i.modele ? fmtNombre(i.modele.mae, 2) : "—"}</td>
                      <td>{t(`statut_${i.statut}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>{t("meth_previsions_p2")}</p>
          </section>

          <section id="signaux">
            <h2>{t("meth_signaux_titre")}</h2>
            <p>{t("meth_signaux_p1")}</p>
            <ol>
              <li>{t("meth_signaux_r1")}</li>
              <li>{t("meth_signaux_r2", { seuil: fmtNombre(SEUIL_VARIATION * 100) })}</li>
              <li>{t("meth_signaux_r3")}</li>
            </ol>
          </section>

          <section id="limites">
            <h2>{t("meth_limites_titre")}</h2>
            <ul>
              <li>{t("meth_limites_l1")}</li>
              <li>{t("meth_limites_l2")}</li>
              <li>{t("meth_limites_l3")}</li>
              <li>{t("meth_limites_l4")}</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
