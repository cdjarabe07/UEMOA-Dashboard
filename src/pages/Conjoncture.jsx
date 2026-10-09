import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PAYS, UNION, getIndicateur, valeur, derniereAnnee, comparables } from "../data/portail.js";
import { PERIODE_PREVISION } from "../data/catalogue.js";
import { CRITERES, respecte, evaluerConvergence } from "../lib/convergence.js";
import { fmtCourt, fmtValeur, fmtVariation, libelleUnite } from "../lib/format.js";
import Bandeau from "../components/Bandeau.jsx";
import MatieresPremieres, { NoteMatieres } from "../components/MatieresPremieres.jsx";
import ProjectionsFMI from "../components/ProjectionsFMI.jsx";
import InflationMensuelle from "../components/InflationMensuelle.jsx";

// Indicateurs de la vue d'ensemble, dans l'ordre de lecture.
const SYNTHESE = ["croissance_reelle", "inflation", "solde_budgetaire_pib", "dette_pib", "pression_fiscale", "balance_courante_pib"];
const TABLEAU = ["croissance_reelle", "inflation", "solde_budgetaire_pib", "dette_pib", "pression_fiscale"];

/** /conjoncture : situation de l'Union et des pays, accès à la convergence et aux prévisions. */
export default function Conjoncture() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const annee = Math.min(...SYNTHESE.map(derniereAnnee));
  const critereDe = (id) => CRITERES.find((c) => c.indicateur === id) || null;
  const symbole = (c) => (c.sens === "<=" ? "≤" : "≥");

  const evaluation = evaluerConvergence(annee).filter((e) => e.zone.id !== "uemoa");
  const nbDette = evaluation.filter((e) => e.resultats.find((r) => r.critere.id === "dette")?.respecte).length;
  const periodePrev = PERIODE_PREVISION ? `${PERIODE_PREVISION[0]}–${PERIODE_PREVISION[1]}` : "";

  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { label: t("nav_conjoncture") }]}
        titre={t("conj_titre")}
        sousTitre={t("conj_chapeau", { annee })}
        meta={[
          { label: t("meta_annee"), valeur: String(annee) },
          { label: t("meta_couverture"), valeur: t("acc_meta_couverture", { n: PAYS.length }) },
          { label: t("note_source"), valeur: "BCEAO · DBnomics" },
        ]}
      />

      <section className="section">
        <div className="conteneur">
          <div className="section-tete">
            <div>
              <p className="surtitre">{t("conj_union_surtitre")}</p>
              <h2>{t("conj_union", { annee })}</h2>
            </div>
          </div>
          <div className="defilant">
            <table className="tableau tableau-synthese">
              <thead>
                <tr>
                  <th scope="col">{t("col_indicateur")}</th>
                  {[annee - 2, annee - 1, annee].map((a) => (
                    <th key={a} scope="col" className="num nombre">{a}</th>
                  ))}
                  <th scope="col" className="num">{t("conj_col_variation")}</th>
                  <th scope="col">{t("conj_col_critere")}</th>
                </tr>
              </thead>
              <tbody>
                {SYNTHESE.map((id) => {
                  const ind = getIndicateur(id);
                  const v = valeur(id, UNION.id, annee);
                  const avant = valeur(id, UNION.id, annee - 1);
                  const c = critereDe(id);
                  const ok = c ? respecte(c, v, annee) : null;
                  return (
                    <tr key={id}>
                      <th scope="row">
                        <Link to={`/donnees/${id}`}>{t(ind.court)}</Link>
                        <small>{libelleUnite(ind.unite)}</small>
                      </th>
                      {[annee - 2, annee - 1, annee].map((a) => (
                        <td key={a} className={`num nombre${a === annee ? " valeur-courante" : ""}`}>{fmtCourt(valeur(id, UNION.id, a), ind.unite)}</td>
                      ))}
                      <td className="num nombre">
                        {v != null && avant != null && comparables(id, annee - 1, annee) ? fmtVariation(v - avant, "pt") : "—"}
                      </td>
                      <td className={ok === true ? "critere-ok" : ok === false ? "critere-ko" : undefined}>
                        {c ? `${symbole(c)} ${fmtCourt(c.seuil, ind.unite)} · ${ok ? t("serie_critere_ok") : t("serie_critere_ko")}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="note">{t("source_bceao")}</p>
        </div>
      </section>

      <section className="section section--claire">
        <div className="conteneur">
          <div className="section-tete">
            <div>
              <p className="surtitre">{t("nav_pays")}</p>
              <h2>{t("conj_pays", { annee })}</h2>
              <p>{t("conj_pays_chapeau")}</p>
            </div>
          </div>
          <div className="defilant">
            <table className="tableau tableau-cliquable">
              <thead>
                <tr>
                  <th scope="col">{t("col_pays")}</th>
                  {TABLEAU.map((id) => {
                    const ind = getIndicateur(id);
                    const c = critereDe(id);
                    return (
                      <th key={id} scope="col" className="num">
                        <Link to={`/donnees/${id}`}>{t(ind.court)}</Link>
                        <small>
                          {libelleUnite(ind.unite)}
                          {c && ` · ${symbole(c)} ${fmtCourt(c.seuil, ind.unite)}`}
                        </small>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {[...PAYS, UNION].map((z) => (
                  <tr
                    key={z.id}
                    className={z.id === "uemoa" ? "ligne-union" : undefined}
                    onClick={z.id === "uemoa" ? undefined : () => navigate(`/pays/${z.id}`)}
                  >
                    <th scope="row">{z.id === "uemoa" ? t("zone_uemoa") : <Link to={`/pays/${z.id}`}>{t(`zone_${z.id}`)}</Link>}</th>
                    {TABLEAU.map((id) => {
                      const ind = getIndicateur(id);
                      const v = valeur(id, z.id, annee);
                      const c = critereDe(id);
                      const ko = c && respecte(c, v, annee) === false;
                      return (
                        <td key={id} className={`num nombre${ko ? " hors-seuil" : ""}`}>
                          {fmtCourt(v, ind.unite)}
                          {ko && <span className="visuellement-cache"> ({t("serie_critere_ko")})</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="note">{t("conj_pays_note")} {t("source_bceao")}</p>
        </div>
      </section>

      <section className="section section--claire" id="inflation-mensuelle">
        <div className="conteneur">
          <div className="section-tete">
            <div>
              <p className="surtitre">{t("im_surtitre")}</p>
              <h2>{t("im_section_titre")}</h2>
              <p>{t("im_chapeau")}</p>
            </div>
          </div>
          <InflationMensuelle />
        </div>
      </section>

      <section className="section" id="international">
        <div className="conteneur">
          <div className="section-tete">
            <div>
              <p className="surtitre">{t("conj_international_surtitre")}</p>
              <h2>{t("conj_international_titre")}</h2>
              <p>{t("conj_international_chapeau")}</p>
            </div>
          </div>
          <MatieresPremieres />
          <NoteMatieres />
        </div>
      </section>

      <section className="section section--claire" id="projections">
        <div className="conteneur">
          <div className="section-tete">
            <div>
              <p className="surtitre">{t("conj_projections_surtitre")}</p>
              <h2>{t("conj_projections_titre")}</h2>
              <p>{t("conj_projections_chapeau")}</p>
            </div>
          </div>
          <ProjectionsFMI />
        </div>
      </section>

      <section className="section">
        <div className="conteneur">
          <div className="section-tete">
            <div>
              <p className="surtitre">{t("conj_approfondir_surtitre")}</p>
              <h2>{t("conj_approfondir")}</h2>
            </div>
          </div>
          <div className="renvois renvois--2">
            <Link to="/conjoncture/convergence" className="renvoi">
              <p className="surtitre">{t("nav_convergence")} · {annee}</p>
              <p className="renvoi-chiffre nombre">{nbDette}/{PAYS.length}</p>
              <p className="renvoi-texte">{t("conj_conv_texte")}</p>
              <span className="lien-fleche">{t("conj_conv_lien")} <span className="fleche">→</span></span>
            </Link>
            <Link to="/conjoncture/previsions" className="renvoi">
              <p className="surtitre">{t("nav_previsions")} · {t("zone_senegal")}</p>
              <p className="renvoi-chiffre nombre">{periodePrev}</p>
              <p className="renvoi-texte">{t("conj_prev_texte")}</p>
              <span className="lien-fleche">{t("conj_prev_lien")} <span className="fleche">→</span></span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
