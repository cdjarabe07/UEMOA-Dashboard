import { Link } from "react-router-dom";
import Bandeau from "../components/Bandeau.jsx";
import { useTranslation } from "react-i18next";
import { INDICATEURS as REGIONAUX, PAYS, UNION, SOURCE, RUPTURES, valeur, getIndicateur } from "../data/portail.js";
import { INDICATEURS as PREVISIONNELS, PERIODE_PREVISION } from "../data/catalogue.js";
import { CRITERES } from "../lib/convergence.js";
import { SEUIL_VARIATION } from "../lib/signaux.js";
import { DATE_GENERATION } from "../lib/meta.js";
import { fmtDate, fmtNombre, fmtPeriode, fmtValeur, libelleUnite } from "../lib/format.js";

const SECTIONS = ["sources", "preparation", "ruptures", "indicateurs", "convergence", "previsions", "signaux", "attention", "limites"];

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

          <section id="ruptures">
            <h2>{t("meth_ruptures_titre")}</h2>
            <p>{t("meth_ruptures_p1")}</p>
            {RUPTURES.map((r) => {
              const an = r.premiere_annee;
              const ind = getIndicateur(r.indicateurs[0]);
              const totale = r.etabli.find((e) => e.grandeur === "dette_publique_totale");
              const ext = r.etabli.find((e) => e.grandeur === "dette_publique_exterieure");
              return (
                <div key={r.id} className="meth-rupture">
                  <h3>{t("rupture_titre", { annee: an })} · {t(ind.libelle)}</h3>
                  <p>{t("rupture_resume", { annee: an })}</p>
                  <h4>{t("rupture_etabli_titre")}</h4>
                  <ul>
                    {totale && (
                      <li>
                        {t("rupture_etabli_total", {
                          annee: totale.annee,
                          zone: t(`zone_${totale.zone}`),
                          montant: fmtValeur(totale.montant_mds_fcfa, "Mds FCFA", 1),
                          pct: fmtValeur(totale.pct_pib, "% du PIB"),
                        })}{" "}
                        <a href={totale.url} target="_blank" rel="noreferrer">{totale.source}</a>, {totale.reference}.{" "}
                        {t("meth_ruptures_imeco", { annee: totale.annee, pct: fmtValeur(valeur(ind.id, UNION.id, totale.annee), "% du PIB") })}
                      </li>
                    )}
                    {ext && (
                      <li>
                        {t("meth_ruptures_ext", { annee: ext.annee })}{" "}
                        <a href={ext.url} target="_blank" rel="noreferrer">{ext.source}</a>, {ext.reference}.
                      </li>
                    )}
                  </ul>
                  {ext && (
                    <div className="defilant">
                      <table className="tableau">
                        <caption>{t("meth_ruptures_tableau", { avant: an - 1, annee: an })}</caption>
                        <thead>
                          <tr>
                            <th scope="col">{t("col_pays")}</th>
                            <th scope="col" className="num">{t("meth_ruptures_col_serie", { annee: an - 1 })}</th>
                            <th scope="col" className="num">{t("meth_ruptures_col_ext", { annee: an })}</th>
                            <th scope="col" className="num">{t("meth_ruptures_col_serie", { annee: an })}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...PAYS, UNION].map((z) => (
                            <tr key={z.id} className={z.id === "uemoa" ? "ligne-union" : undefined}>
                              <th scope="row">{t(`zone_${z.id}`)}</th>
                              <td className="num nombre">{fmtNombre(valeur(ind.id, z.id, an - 1), 1, true)}</td>
                              <td className="num nombre">{fmtNombre(ext.pct_pib[z.id], 1, true)}</td>
                              <td className="num nombre">{fmtNombre(valeur(ind.id, z.id, an), 1, true)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <h4>{t("rupture_deduit_titre")}</h4>
                  <p>{t("rupture_deduit", { avant: an - 1, annee: an })} {t("meth_ruptures_controle")}</p>
                  <p>{t("rupture_consequence", { annee: an })}</p>
                  <p className="texte-secondaire">{t("meth_ruptures_verifie", { date: fmtDate(new Date(r.verifie_le)) })}</p>
                </div>
              );
            })}
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
                      <th scope="row"><Link to={`/donnees/${i.id}`}>{t(i.libelle)}</Link></th>
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
                    <th scope="col" className="num">{t("meth_mae_naif")}</th>
                    <th scope="col">{t("meth_publication")}</th>
                  </tr>
                </thead>
                <tbody>
                  {PREVISIONNELS.map((i) => (
                    <tr key={i.id}>
                      <th scope="row">{t(i.libelle)}</th>
                      <td>{i.modele ? `${i.modele.type} ${i.modele.ordre}` : t("prev_modele_nd")}</td>
                      <td className="num nombre">{i.modele ? fmtNombre(i.modele.mae, 2) : "—"}</td>
                      <td className="num nombre">{i.modele ? fmtNombre(i.modele.maeNaif, 2) : "—"}</td>
                      <td>{i.previsions.length ? t("meth_publiee") : t("meth_non_publiee")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="texte-secondaire">{t("meth_previsions_unites")}</p>
            <p>{t("meth_previsions_validation", {
              n: PREVISIONNELS.find((i) => i.modele)?.modele.nbAnneesValidation ?? "—",
              h: PREVISIONNELS.find((i) => i.modele)?.modele.horizonValidation ?? "—",
            })}</p>
            <p>{t("meth_previsions_p2", { periode: fmtPeriode(PERIODE_PREVISION) })}</p>
            {PREVISIONNELS.find((i) => i.modele?.dateEntrainement) && (
              <p className="texte-secondaire">
                {t("meth_previsions_date", { date: fmtDate(new Date(PREVISIONNELS.find((i) => i.modele?.dateEntrainement).modele.dateEntrainement)) })}
              </p>
            )}
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

          <section id="attention">
            <h2>{t("meth_attention_titre")}</h2>
            <p>{t("meth_attention_p1")}</p>
            <ol>
              <li>{t("meth_attention_r1")}</li>
              <li>{t("meth_attention_r2")}</li>
              <li>{t("meth_attention_r3")}</li>
              <li>{t("meth_attention_r4")}</li>
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
