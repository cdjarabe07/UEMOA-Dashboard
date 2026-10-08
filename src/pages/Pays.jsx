import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import { PAYS, UNION, INDICATEURS, valeur, serie, derniereAnnee, getIndicateur, famillesDisponibles, anneeRupture } from "../data/portail.js";
import { CRITERES, respecte } from "../lib/convergence.js";
import { fmtValeur, fmtCourt, fmtPeriode, libelleUnite } from "../lib/format.js";
import { PERIODE_PREVISION } from "../data/catalogue.js";
import { GraphiqueSeries, COULEUR_ZONE } from "../components/Graphiques.jsx";
import Bandeau from "../components/Bandeau.jsx";
import TableauIndicateurs from "../components/TableauIndicateurs.jsx";
import Visualisation from "../components/Visualisation.jsx";
import Onglets from "../components/Onglets.jsx";
import CartesPays from "../components/CartesPays.jsx";
import Exports from "../components/Exports.jsx";
import MatieresPremieres, { NoteMatieres } from "../components/MatieresPremieres.jsx";
import ProjectionsFMI from "../components/ProjectionsFMI.jsx";
import { produitsDuPays, ANNEES_PROJECTION } from "../data/fmi.js";
import ConditionsDeVie from "../components/ConditionsDeVie.jsx";
import { PhotoPays } from "../components/HerosPhotos.jsx";
import { photoDe } from "../contenu/photos.js";
import Introuvable from "./Introuvable.jsx";

// Chiffres clés affichés en tête de fiche.
const CLES = ["croissance_reelle", "inflation", "dette_pib", "solde_budgetaire_pib"];

const COLONNES_LISTE = ["croissance_reelle", "inflation", "dette_pib", "solde_budgetaire_pib", "pression_fiscale", "balance_courante_pib"];

/** /pays : tableau comparatif des huit pays. */
export function ListePays() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const an = derniereAnnee("croissance_reelle");
  const colonnes = [{ cle: "pays", titre: t("col_pays") }, ...COLONNES_LISTE.map((id) => ({ cle: id, titre: `${t(`rg_${id}_court`)} (${libelleUnite(getIndicateur(id).unite)})` }))];
  const lignes = [...PAYS, UNION].map((p) => ({
    pays: t(`zone_${p.id}`),
    ...Object.fromEntries(COLONNES_LISTE.map((id) => [id, valeur(id, p.id, an)])),
  }));
  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { label: t("nav_pays") }]}
        titre={t("pays_titre")}
        sousTitre={t("pays_chapeau")}
        meta={[
          { label: t("meta_annee"), valeur: an },
          { label: t("meta_source"), valeur: "BCEAO · DBnomics" },
        ]}
      />
      <section className="section">
        <div className="conteneur">
          <div className="section-tete">
            <div>
              <h2>{t("pays_choisir_titre")}</h2>
              <p>{t("pays_choisir_chapeau")}</p>
            </div>
          </div>
          <CartesPays />
        </div>
      </section>
      <section className="section section--claire">
        <div className="conteneur">
          <div className="section-tete">
            <div>
              <h2>{t("pays_tableau_titre", { annee: an })}</h2>
              <p>{t("pays_tableau_chapeau")}</p>
            </div>
          </div>
          <div className="defilant">
            <table className="tableau tableau--aere tableau-cliquable">
              <thead>
                <tr>
                  <th scope="col">{t("col_pays")}</th>
                  {COLONNES_LISTE.map((id) => (
                    <th key={id} scope="col" className="num">
                      {t(`rg_${id}_court`)}
                      <small>{libelleUnite(getIndicateur(id).unite)}</small>
                    </th>
                  ))}
                  <th scope="col"><span className="visuellement-cache">{t("pays_voir_profil")}</span></th>
                </tr>
              </thead>
              <tbody>
                {[...PAYS, UNION].map((p) => (
                  <tr
                    key={p.id}
                    className={p.id === "uemoa" ? "ligne-union" : undefined}
                    onClick={p.id === "uemoa" ? undefined : () => navigate(`/pays/${p.id}`)}
                  >
                    <th scope="row">
                      {p.id === "uemoa" ? (
                        t("zone_uemoa")
                      ) : (
                        <Link to={`/pays/${p.id}`} className="lien-pays">
                          <i style={{ background: COULEUR_ZONE[p.id] }} />
                          {t(`zone_${p.id}`)}
                        </Link>
                      )}
                    </th>
                    {COLONNES_LISTE.map((id) => (
                      <td key={id} className="num nombre">{fmtCourt(valeur(id, p.id, an), getIndicateur(id).unite)}</td>
                    ))}
                    <td className="cellule-profil">
                      {p.id !== "uemoa" && (
                        <Link to={`/pays/${p.id}`} onClick={(e) => e.stopPropagation()}>
                          {t("pays_profil_court")} <span className="fleche">→</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="note">{t("pays_note", { annee: an })}</p>
          <Exports nom="uemoa_pays" titre={t("pays_titre")} colonnes={colonnes} lignes={lignes} />
        </div>
      </section>
    </>
  );
}

/** /pays/:id : profil d'un pays. */
export default function ProfilPays() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [indGraph, setIndGraph] = useState("croissance_reelle");
  const pays = PAYS.find((p) => p.id === id);
  if (!pays) return <Introuvable />;

  const an = derniereAnnee("croissance_reelle");
  const anConv = derniereAnnee("dette_pib");
  const nom = t(`zone_${pays.id}`);
  const indicateurs = INDICATEURS.filter((i) => i.parPays);
  const debut = Math.min(...indicateurs.map((i) => serie(i.id, pays.id)[0]?.annee ?? 9999));

  // Export : une ligne par année, une colonne par indicateur.
  const annees = [...new Set(indicateurs.flatMap((i) => serie(i.id, pays.id).map((p) => p.annee)))].sort((a, b) => b - a);
  const colonnesExport = [{ cle: "annee", titre: t("col_annee") }, ...indicateurs.map((i) => ({ cle: i.id, titre: `${t(i.libelle)} (${libelleUnite(i.unite)})` }))];
  const lignesExport = annees.map((a) => ({ annee: a, ...Object.fromEntries(indicateurs.map((i) => [i.id, valeur(i.id, pays.id, a)])) }));

  // Graphique choisi : pays face à l'Union (sauf niveaux en Mds FCFA).
  const ig = getIndicateur(indGraph);
  const seriesGraph = { [pays.id]: serie(indGraph, pays.id).filter((p) => p.annee >= 1990) };
  if (ig.unite !== "Mds FCFA") seriesGraph.uemoa = serie(indGraph, UNION.id).filter((p) => p.annee >= 1990);
  const anneesGraph = seriesGraph[pays.id].map((p) => p.annee).slice(-10);

  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { to: "/pays", label: t("nav_pays") }, { label: nom }]}
        surtitre={t("profil_surtitre")}
        titre={nom}
        sousTitre={t("profil_sous_titre", { periode: fmtPeriode([debut, an]) })}
        meta={[
          { label: t("meta_derniere_annee"), valeur: an },
          { label: t("meta_source"), valeur: "BCEAO · DBnomics" },
        ]}
      >
        <label className="selecteur selecteur--clair">
          <span>{t("profil_changer")}</span>
          <select value={pays.id} onChange={(e) => navigate(`/pays/${e.target.value}`)}>
            {PAYS.map((p) => (
              <option key={p.id} value={p.id}>{t(`zone_${p.id}`)}</option>
            ))}
          </select>
        </label>
      </Bandeau>

      <div className="conteneur">
        <PhotoPays photo={photoDe(pays.id)} />
      </div>

      {/* Principaux indicateurs, par thème */}
      <section className="section">
        <div className="conteneur">
          <div className="section-tete">
            <div>
              <h2>{t("profil_indicateurs_titre")}</h2>
              <p>{t("profil_indicateurs_chapeau", { pays: nom })}</p>
            </div>
          </div>
          <dl className="chiffres-cles">
            {CLES.map((cle) => {
              const ind = getIndicateur(cle);
              return (
                <div key={cle}>
                  <dt>{t(ind.court)}</dt>
                  <dd className="nombre">{fmtCourt(valeur(cle, pays.id, an), ind.unite)}</dd>
                  <span className="nombre">
                    {ind.unite === "% du PIB" ? `${t("unite_pct_pib")} · ` : ""}
                    {t("zone_uemoa")} {fmtCourt(valeur(cle, UNION.id, an), ind.unite)}
                  </span>
                </div>
              );
            })}
          </dl>

          <Onglets
            label={t("profil_indicateurs_titre")}
            onglets={famillesDisponibles()
              .map((f) => ({ ...f, indicateurs: f.indicateurs.filter((i) => i.parPays) }))
              .filter((f) => f.indicateurs.length > 0)
              .map((f) => ({
                id: f.id,
                libelle: t(`famille_${f.id}`),
                contenu: (
                  <TableauIndicateurs
                    couleur={COULEUR_ZONE[pays.id]}
                    colonnes={{
                      indicateur: t("col_indicateur"),
                      valeur: nom,
                      comparaison: t("zone_uemoa"),
                      tendance: t("col_tendance"),
                    }}
                    lignes={f.indicateurs.map((i) => {
                      const s = serie(i.id, pays.id);
                      const der = s[s.length - 1];
                      return {
                        id: i.id,
                        libelle: t(i.libelle),
                        unite: libelleUnite(i.unite),
                        lien: `/donnees/${i.id}`,
                        valeur: der ? fmtValeur(der.valeur, i.unite, undefined, true) : "—",
                        annee: der?.annee ?? "",
                        comparaison: der ? fmtValeur(valeur(i.id, UNION.id, der.annee), i.unite, undefined, true) : "—",
                        points: s.filter((p) => p.annee >= 2005),
                        rupture: anneeRupture(i.id),
                      };
                    })}
                  />
                ),
              }))}
          />
          <Exports nom={`uemoa_${pays.id}`} titre={`${nom} — ${t("marque")}`} colonnes={colonnesExport} lignes={lignesExport} />
        </div>
      </section>

      {/* Convergence */}
      <section className="section section--claire">
        <div className="conteneur conv-pays">
          <div>
            <h2>{t("profil_conv_titre", { annee: anConv })}</h2>
            <p className="texte-secondaire">{t("profil_conv_chapeau")}</p>
            <Link to="/conjoncture/convergence" className="lien-fleche">{t("profil_conv_lien")}</Link>
          </div>
          <div className="defilant">
          <table className="tableau tableau--aere">
            <thead>
              <tr>
                <th scope="col">{t("col_critere")}</th>
                <th scope="col">{t("col_seuil")}</th>
                <th scope="col" className="num">{nom}</th>
                <th scope="col">{t("col_statut")}</th>
              </tr>
            </thead>
            <tbody>
              {CRITERES.map((c) => {
                const v = valeur(c.indicateur, pays.id, anConv);
                const ok = respecte(c, v, anConv);
                return (
                  <tr key={c.id}>
                    <th scope="row">{t(`conv_${c.id}`)}</th>
                    <td>{t(`conv_${c.id}_seuil`)}</td>
                    <td className="num nombre">{fmtValeur(v, getIndicateur(c.indicateur).unite, undefined, true)}</td>
                    <td className={ok === true ? "statut ok" : ok === false ? "statut ko" : "statut"}>
                      {ok === true && <><Check size={16} /> {t("conv_ok")}</>}
                      {ok === false && <><X size={16} /> {t("conv_ko")}</>}
                      {ok === null && t("nd")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </section>

      {/* Population et conditions de vie (Banque mondiale) */}
      <section className="section section--claire">
        <div className="conteneur">
          <div className="section-tete">
            <div>
              <p className="surtitre">{t("bm_surtitre")}</p>
              <h2>{t("bm_titre", { pays: nom })}</h2>
              <p>{t("bm_chapeau")}</p>
            </div>
          </div>
          <ConditionsDeVie zone={pays.id} />
        </div>
      </section>

      {/* Environnement international : prix suivis et projections du FMI */}
      <section className="section">
        <div className="conteneur">
          <div className="section-tete">
            <div>
              <p className="surtitre">{t("conj_international_surtitre")}</p>
              <h2>{t("profil_international_titre", { pays: nom })}</h2>
              <p>{t("profil_international_chapeau")}</p>
            </div>
          </div>
          {produitsDuPays(pays.id).length > 0 && (
            <>
              <h3 className="titre-colonne">{t("profil_produits_titre")}</h3>
              <MatieresPremieres produits={produitsDuPays(pays.id).map((p) => p.id)} />
              <NoteMatieres />
            </>
          )}
          <h3 className="titre-colonne profil-projections-titre">{t("profil_projections_titre", { debut: ANNEES_PROJECTION[0], fin: ANNEES_PROJECTION[2] })}</h3>
          <ProjectionsFMI zones={[pays.id]} compact />
          <p className="note">{t("profil_projections_note")} <Link to="/conjoncture#projections">{t("profil_projections_lien")}</Link></p>
        </div>
      </section>

      {/* Graphique au choix */}
      <section className="section">
        <div className="conteneur">
          <Visualisation
            titre={t("profil_graph_titre", { indicateur: t(ig.libelle), pays: nom })}
            sousTitre={libelleUnite(ig.unite)}
            outils={
              <label className="selecteur">
                <span className="visuellement-cache">{t("col_indicateur")}</span>
                <select value={indGraph} onChange={(e) => setIndGraph(e.target.value)}>
                  {indicateurs.map((i) => (
                    <option key={i.id} value={i.id}>{t(i.court)}</option>
                  ))}
                </select>
              </label>
            }
            graphique={
              <>
                <GraphiqueSeries
                  series={seriesGraph}
                  unite={ig.unite}
                  noms={{ [pays.id]: nom, uemoa: t("zone_uemoa") }}
                  hauteur={360}
                  zero={ig.unite !== "Mds FCFA"}
                  rupture={anneeRupture(indGraph)}
                />
                <p className="legende">
                  <span><i style={{ background: COULEUR_ZONE[pays.id] }} /> {nom}</span>
                  {seriesGraph.uemoa && <span><i className="pointille pointille--encre" /> {t("zone_uemoa")}</span>}
                </p>
              </>
            }
            tableau={
              <div className="defilant">
                <table className="tableau">
                  <thead>
                    <tr>
                      <th scope="col">{t("col_annee")}</th>
                      {anneesGraph.map((a) => <th key={a} scope="col" className={`num nombre${a === anneeRupture(indGraph) ? " apres-rupture" : ""}`}>{a}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(seriesGraph).map((z) => (
                      <tr key={z} className={z === "uemoa" ? "ligne-union" : undefined}>
                        <th scope="row">{t(`zone_${z}`)}</th>
                        {anneesGraph.map((a) => <td key={a} className={`num nombre${a === anneeRupture(indGraph) ? " apres-rupture" : ""}`}>{fmtCourt(valeur(indGraph, z, a), ig.unite)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
            notes={{
              lecture: anneeRupture(indGraph) ? t("rupture_resume", { annee: anneeRupture(indGraph) }) : null,
              champ: ig.unite !== "Mds FCFA" ? t("champ_pays_union", { pays: nom }) : nom,
              source: t("source_bceao"),
            }}
          />
          {pays.id === "senegal" && (
            <Link to="/conjoncture/previsions" className="encart-lien">
              <span>
                <b>{t("profil_prev_titre", { periode: fmtPeriode(PERIODE_PREVISION) })}</b> {t("profil_prev_texte")}
              </span>
              <span className="fleche" aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
