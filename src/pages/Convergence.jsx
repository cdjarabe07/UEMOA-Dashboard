import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import { PAYS, UNION, getIndicateur, valeur, derniereAnnee, anneesDisponibles, anneeRupture } from "../data/portail.js";
import { CRITERES, respecte, nonComparable, evaluerConvergence } from "../lib/convergence.js";
import { fmtCourt, fmtValeur, libelleUnite } from "../lib/format.js";
import { BarresPays } from "../components/Graphiques.jsx";
import Bandeau from "../components/Bandeau.jsx";
import Visualisation from "../components/Visualisation.jsx";
import Exports from "../components/Exports.jsx";
import Onglets from "../components/Onglets.jsx";

// Années où les quatre critères sont calculables (séries de finances publiques).
const ANNEES = anneesDisponibles("dette_pib");

export default function Convergence() {
  const { t } = useTranslation();
  const [anneeChoisie, setAnneeChoisie] = useState(null);
  const [critereId, setCritereId] = useState("solde");
  const annee = ANNEES.includes(anneeChoisie) ? anneeChoisie : derniereAnnee("dette_pib");
  const tableau = evaluerConvergence(annee);
  const critere = CRITERES.find((c) => c.id === critereId);
  const indCritere = getIndicateur(critere.indicateur);

  // Nombre de pays respectant chaque critère, sur les dix dernières années.
  const dixAns = ANNEES.slice(-10);
  const conformes = (c, a) => PAYS.filter((p) => respecte(c, valeur(c.indicateur, p.id, a), a) === true).length;
  // Critères non évaluables l'année choisie (rupture de périmètre de la série).
  const ncAnnee = CRITERES.filter((c) => nonComparable(c, annee));
  const ncCritere = nonComparable(critere, annee);

  const colonnesExport = [
    { cle: "pays", titre: t("col_pays") },
    ...CRITERES.map((c) => ({ cle: c.id, titre: `${t(`conv_${c.id}`)} (${t(`conv_${c.id}_seuil`)})` })),
    { cle: "total", titre: t("conv_total") },
  ];
  const lignesExport = tableau.map((l) => ({
    pays: t(`zone_${l.zone.id}`),
    ...Object.fromEntries(l.resultats.map((r) => [r.critere.id, r.nonComparable ? t("non_comparable") : r.valeur])),
    total: `${l.nbRespectes}/${l.nbEvalues}`,
  }));

  const nbTous = tableau.filter((l) => l.zone.id !== "uemoa" && l.nbRespectes === l.nbEvalues && l.nbEvalues > 0).length;

  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { to: "/conjoncture", label: t("nav_conjoncture") }, { label: t("nav_convergence") }]}
        surtitre={t("conv_surtitre")}
        titre={t("conv_titre")}
        sousTitre={t("conv_chapeau")}
        meta={[
          { label: t("conv_meta_texte"), valeur: t("conv_meta_acte") },
          { label: t("conv_meta_criteres"), valeur: t("conv_meta_criteres_val", { n: CRITERES.length }) },
          { label: t("meta_source"), valeur: "BCEAO · DBnomics" },
        ]}
      />

      <section className="section">
        <div className="conteneur">
          <Onglets
            label={t("conv_titre")}
            onglets={[
              {
                id: "tableau",
                libelle: t("onglet_conv_tableau"),
                contenu: (
                  <>
                    <Visualisation
                      titre={t("conv_tableau_titre", { annee })}
                      sousTitre={t("conv_tableau_sous_titre", { n: nbTous, total: PAYS.length })}
                      outils={
                        <label className="selecteur">
                          <span>{t("col_annee")}</span>
                          <select value={annee} onChange={(e) => setAnneeChoisie(Number(e.target.value))}>
                            {[...ANNEES].reverse().map((a) => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </label>
                      }
                      graphique={
                        <div className="defilant">
                          <table className="tableau tableau--aere tableau-conv">
                            <thead>
                              <tr>
                                <th scope="col">{t("col_pays")}</th>
                                {CRITERES.map((c) => (
                                  <th key={c.id} scope="col" className="num">
                                    {t(`conv_${c.id}`)}
                                    <small>{t(`conv_${c.id}_seuil`)}</small>
                                  </th>
                                ))}
                                <th scope="col" className="num">{t("conv_total")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tableau.map((l) => (
                                <tr key={l.zone.id} className={l.zone.id === "uemoa" ? "ligne-union" : undefined}>
                                  <th scope="row">
                                    {l.zone.id === "uemoa" ? t("zone_uemoa") : <Link to={`/pays/${l.zone.id}`}>{t(`zone_${l.zone.id}`)}</Link>}
                                  </th>
                                  {l.resultats.map((r) => (
                                    <td key={r.critere.id} className={`num ${r.respecte === true ? "ok" : r.respecte === false ? "ko" : ""}${r.nonComparable ? " nc" : ""}`}>
                                      <span className="nombre">{fmtCourt(r.valeur, getIndicateur(r.critere.indicateur).unite)}</span>
                                      {r.respecte === true && <Check size={15} aria-label={t("conv_ok")} />}
                                      {r.respecte === false && <X size={15} aria-label={t("conv_ko")} />}
                                      {r.nonComparable && r.valeur != null && <small className="nc-mention">{t("non_comparable")}</small>}
                                    </td>
                                  ))}
                                  <td className="num nombre total">{l.nbRespectes}/{l.nbEvalues}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      }
                      notes={{
                        lecture: ncAnnee.length
                          ? `${t("conv_lecture")} ${t("conv_nc_note", { critere: t(`conv_${ncAnnee[0].id}`), annee: anneeRupture(ncAnnee[0].indicateur) })}`
                          : t("conv_lecture"),
                        champ: t("champ_uemoa", { n: PAYS.length }),
                        source: t("conv_source"),
                      }}
                    />
                    <Exports nom={`uemoa_convergence_${annee}`} titre={t("conv_tableau_titre", { annee })} colonnes={colonnesExport} lignes={lignesExport} />
                  </>
                ),
              },
              {
                id: "critere",
                libelle: t("onglet_conv_critere"),
                contenu: (
                  <>
                    <Visualisation
                      titre={t("conv_detail_titre", { critere: t(`conv_${critere.id}`), annee })}
                      sousTitre={`${t(`conv_${critere.id}_seuil`)} · ${libelleUnite(indCritere.unite)}`}
                      outils={
                        <div className="bascule" role="group" aria-label={t("conv_choix")}>
                          {CRITERES.map((c) => (
                            <button key={c.id} type="button" aria-pressed={c.id === critereId} onClick={() => setCritereId(c.id)}>
                              {t(`conv_${c.id}`)}
                            </button>
                          ))}
                        </div>
                      }
                      graphique={
                        <BarresPays
                          donnees={PAYS.map((p) => ({ id: p.id, nom: t(`zone_${p.id}`), valeur: valeur(critere.indicateur, p.id, annee) }))}
                          unite={indCritere.unite}
                          union={valeur(critere.indicateur, UNION.id, annee)}
                          libelleUnion={t("zone_uemoa")}
                          seuil={ncCritere ? null : { valeur: critere.seuil, libelle: t("conv_seuil_libelle", { seuil: fmtValeur(critere.seuil, indCritere.unite) }) }}
                          couleur={(d) => (ncCritere ? "#8a8f98" : respecte(critere, d.valeur, annee) ? "#4f6b35" : "#b4532e")}
                        />
                      }
                      notes={{
                        lecture: ncCritere
                          ? t("conv_nc_note", { critere: t(`conv_${critere.id}`), annee: anneeRupture(critere.indicateur) })
                          : t(critere.sens === ">=" ? "conv_lecture_min" : "conv_lecture_max", {
                              seuil: fmtValeur(critere.seuil, indCritere.unite),
                            }),
                        source: t("source_bceao"),
                      }}
                    />
                  </>
                ),
              },
              {
                id: "temps",
                libelle: t("onglet_conv_temps"),
                contenu: (
                  <>
                    <Visualisation
                      titre={t("conv_temps_titre")}
                      sousTitre={t("conv_temps_sous_titre", { n: PAYS.length })}
                      graphique={
                        <div className="defilant">
                          <table className="tableau tableau--aere tableau-temps">
                            <thead>
                              <tr>
                                <th scope="col">{t("col_critere")}</th>
                                {dixAns.map((a) => <th key={a} scope="col" className="num nombre">{a}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {CRITERES.map((c) => (
                                <tr key={c.id}>
                                  <th scope="row">
                                    {t(`conv_${c.id}`)} <small>{t(`conv_${c.id}_seuil`)}</small>
                                  </th>
                                  {dixAns.map((a) => {
                                    if (nonComparable(c, a)) {
                                      return (
                                        <td key={a} className="num nc">
                                          <abbr title={t("non_comparable")}>{t("nc_court")}</abbr>
                                        </td>
                                      );
                                    }
                                    const n = conformes(c, a);
                                    return (
                                      <td key={a} className="num">
                                        <span className="cellule-part" style={{ "--part": n / PAYS.length }}>
                                          <b className="nombre">{n}</b>
                                        </span>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      }
                      notes={{
                        lecture: CRITERES.some((c) => dixAns.some((a) => nonComparable(c, a)))
                          ? `${t("conv_temps_lecture", { n: PAYS.length })} ${t("conv_nc_note", { critere: t("conv_dette"), annee: anneeRupture("dette_pib") })}`
                          : t("conv_temps_lecture", { n: PAYS.length }),
                        source: t("source_bceao"),
                      }}
                    />
                  </>
                ),
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
