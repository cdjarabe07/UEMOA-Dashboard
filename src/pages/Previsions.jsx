import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";
import { INDICATEURS } from "../data/catalogue.js";
import { calculerSignaux, texteSignal } from "../lib/signaux.js";
import { fmtValeur, fmtCourt, fmtIntervalle, fmtNombre, fmtPeriode, libelleUnite } from "../lib/format.js";
import { GraphiquePrevision, serieAvecPrevision } from "../components/Graphiques.jsx";
import Bandeau from "../components/Bandeau.jsx";
import Visualisation from "../components/Visualisation.jsx";
import Exports from "../components/Exports.jsx";
import Onglets from "../components/Onglets.jsx";

const anneeDe = (period) => parseInt(String(period).slice(0, 4), 10);

export default function Previsions() {
  const { t } = useTranslation();
  const [actifId, setActifId] = useState("pib");
  const ind = INDICATEURS.find((i) => i.id === actifId) || INDICATEURS[0];
  const historique = ind.historique.map((o) => ({ annee: anneeDe(o.period), valeur: o.value }));
  const data = serieAvecPrevision(historique, ind.previsions, historique.length ? 2000 : null);
  const derniere = ind.previsions[ind.previsions.length - 1];
  const avecPrevision = INDICATEURS.filter((i) => i.previsions.length > 0);
  const signaux = calculerSignaux();

  // Tableau de la visualisation : 5 dernières observations + prévisions.
  const lignesVue = [
    ...historique.slice(-5).map((h) => ({ annee: h.annee, type: t("leg_observe"), valeur: h.valeur, ic: null })),
    ...ind.previsions.map((p) => ({
      annee: p.annee,
      type: t("leg_prevision"),
      valeur: p.valeur_prevue,
      ic: p.borne_basse != null ? fmtIntervalle(p.borne_basse, p.borne_haute, ind.unite) : null,
    })),
  ];

  const colonnesExport = [
    { cle: "indicateur", titre: t("col_indicateur") },
    { cle: "unite", titre: t("meta_unite") },
    { cle: "annee", titre: t("col_annee") },
    { cle: "prevision", titre: t("leg_prevision") },
    { cle: "borne_basse", titre: t("col_borne_basse") },
    { cle: "borne_haute", titre: t("col_borne_haute") },
  ];
  const lignesExport = avecPrevision.flatMap((i) =>
    i.previsions.map((p) => ({
      indicateur: t(i.libelle),
      unite: i.unite,
      annee: p.annee,
      prevision: p.valeur_prevue,
      borne_basse: p.borne_basse,
      borne_haute: p.borne_haute,
    }))
  );

  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { label: t("nav_previsions") }]}
        surtitre={t("prev_surtitre")}
        titre={t("prev_titre")}
        sousTitre={t("prev_chapeau")}
        meta={[
          { label: t("prev_meta_zone"), valeur: t("zone_senegal") },
          { label: t("prev_meta_horizon"), valeur: "2026–2027" },
          { label: t("prev_modele"), valeur: "SARIMA" },
          { label: t("prev_meta_incertitude"), valeur: t("leg_ic") },
        ]}
      />

      <section className="section">
        <div className="conteneur">
          <Visualisation
            titre={t(ind.libelle)}
            sousTitre={`${t(ind.description)} · ${libelleUnite(ind.unite)} · ${t(`statut_${ind.statut}`)}`}
            outils={
              <label className="selecteur">
                <span className="visuellement-cache">{t("prev_choix")}</span>
                <select value={ind.id} onChange={(e) => setActifId(e.target.value)}>
                  {INDICATEURS.map((i) => (
                    <option key={i.id} value={i.id}>{t(i.libelle)}</option>
                  ))}
                </select>
              </label>
            }
            graphique={
              data.length > 1 ? (
                <GraphiquePrevision data={data} unite={ind.unite} hauteur={380} />
              ) : (
                <p className="note">{t("prev_pas_de_graphique")}</p>
              )
            }
            tableau={
              <table className="tableau tableau--aere">
                <thead>
                  <tr>
                    <th scope="col">{t("col_annee")}</th>
                    <th scope="col">{t("col_nature")}</th>
                    <th scope="col" className="num">{libelleUnite(ind.unite)}</th>
                    <th scope="col" className="num">{t("leg_ic")}</th>
                  </tr>
                </thead>
                <tbody>
                  {lignesVue.map((l) => (
                    <tr key={`${l.annee}-${l.type}`} className={l.ic ? "ligne-prevision" : undefined}>
                      <td className="nombre">{l.annee}</td>
                      <td>{l.type}</td>
                      <td className="num nombre">{fmtValeur(l.valeur, ind.unite, undefined, true)}</td>
                      <td className="num nombre">{l.ic ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
            notes={{
              lecture: derniere
                ? t("prev_lecture", {
                    annee: derniere.annee,
                    valeur: fmtValeur(derniere.valeur_prevue, ind.unite),
                    bas: fmtValeur(derniere.borne_basse, ind.unite),
                    haut: fmtValeur(derniere.borne_haute, ind.unite),
                  })
                : t("prev_aucune"),
              champ: t(ind.description),
              source: t("prev_source"),
            }}
          />

          <dl className="fiche-modele">
            <div>
              <dt>{t("prev_modele")}</dt>
              <dd>{ind.modele ? `${ind.modele.type} ${ind.modele.ordre}` : t("prev_modele_nd")}</dd>
            </div>
            <div>
              <dt>{t("prev_mae")}</dt>
              <dd className="nombre">
                {ind.modele ? `${fmtNombre(ind.modele.mae, 2)} ${ind.unite === "%" ? "pt" : libelleUnite(ind.unite)}` : t("prev_modele_nd")}
              </dd>
            </div>
            <div>
              <dt>{t("prev_historique")}</dt>
              <dd className="nombre">{ind.periodeHistorique ? fmtPeriode(ind.periodeHistorique) : t("prev_historique_nd")}</dd>
            </div>
            <div>
              <dt>{t("prev_meta_horizon")}</dt>
              <dd className="nombre">{ind.periodePrevision ? fmtPeriode(ind.periodePrevision) : t("prev_aucune_court")}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section section--claire">
        <div className="conteneur">
          <Onglets
            label={t("nav_previsions")}
            onglets={[
              {
                id: "toutes",
                libelle: t("prev_tableau"),
                contenu: (
                  <>
                    <p className="texte-secondaire">{t("prev_tableau_chapeau")}</p>
                    <div className="defilant">
                      <table className="tableau tableau--aere">
                        <thead>
                          <tr>
                            <th scope="col">{t("col_indicateur")}</th>
                            <th scope="col" className="num">2026</th>
                            <th scope="col" className="num">{t("col_intervalle")} 2026</th>
                            <th scope="col" className="num">2027</th>
                            <th scope="col" className="num">{t("col_intervalle")} 2027</th>
                          </tr>
                        </thead>
                        <tbody>
                          {avecPrevision.map((i) => {
                            const [a, b] = i.previsions;
                            return (
                              <tr key={i.id}>
                                <th scope="row">
                                  <button type="button" className="lien-bouton" onClick={() => { setActifId(i.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                                    {t(i.libelle)}
                                  </button>
                                  <small>{libelleUnite(i.unite)}</small>
                                </th>
                                <td className="num nombre">{fmtValeur(a?.valeur_prevue, i.unite, undefined, true)}</td>
                                <td className="num nombre discret">{a?.borne_basse != null ? `${fmtCourt(a.borne_basse, i.unite)} – ${fmtCourt(a.borne_haute, i.unite)}` : "—"}</td>
                                <td className="num nombre">{fmtValeur(b?.valeur_prevue, i.unite, undefined, true)}</td>
                                <td className="num nombre discret">{b?.borne_basse != null ? `${fmtCourt(b.borne_basse, i.unite)} – ${fmtCourt(b.borne_haute, i.unite)}` : "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <Exports nom="uemoa_previsions_senegal" titre={t("prev_titre")} colonnes={colonnesExport} lignes={lignesExport} />
                  </>
                ),
              },
              {
                id: "signaux",
                libelle: t("prev_signaux"),
                contenu: (
                  <>
                    <p className="texte-secondaire">
                      {t("prev_signaux_note")} <Link to="/methodologie#signaux">{t("prev_signaux_lien")}</Link>
                    </p>
                    <ul className="signaux">
                      {signaux.map((s, i) => {
                        const { titre, detail } = texteSignal(s, t);
                        return (
                          <li key={i}>
                            <TriangleAlert size={18} aria-hidden="true" />
                            <span>
                              <b>{titre}</b>
                              {detail}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
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
