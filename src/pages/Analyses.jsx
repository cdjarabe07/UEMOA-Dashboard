import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PAYS, UNION, getIndicateur, serie, valeur, anneeRupture, ruptureDe, zonesDe } from "../data/portail.js";
import { CRITERES } from "../lib/convergence.js";
import { DATE_GENERATION } from "../lib/meta.js";
import { fmtCourt, fmtDate, fmtPeriode, libelleUnite } from "../lib/format.js";
import { useMouvementReduit } from "../lib/mouvement.js";
import {
  ANALYSES,
  DOSSIERS,
  getAnalyse,
  getDossier,
  getPublication,
  analysesDuDossier,
  publicationsDuDossier,
  periodeDossier,
  donneesPlusRecentes,
} from "../contenu/index.js";
import { GraphiqueSeries, COULEUR_ZONE } from "../components/Graphiques.jsx";
import Bandeau from "../components/Bandeau.jsx";
import Apercu from "../components/Apercu.jsx";
import MatieresPremieres, { NoteMatieres } from "../components/MatieresPremieres.jsx";
import Introuvable from "./Introuvable.jsx";

// Texte bilingue d'un contenu : { fr, en } -> langue active (repli sur le français).
export const useLoc = () => {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith("en");
  return (v) => (v == null ? "" : typeof v === "string" ? v : (en && v.en) || v.fr);
};

const dateCourte = (iso) => fmtDate(new Date(`${iso}T00:00:00Z`));

/** Ligne de liste d'une analyse (rubrique, dossier, accueil). */
export function LigneAnalyse({ a }) {
  const { t } = useTranslation();
  const loc = useLoc();
  return (
    <li className="ligne-analyse">
      <Link to={`/analyses/${a.id}`}>
        <span className="ligne-analyse-meta">
          {t(`dossier_${a.dossier}`)} · <time dateTime={a.date_publication}>{dateCourte(a.date_publication)}</time>
          {a.statut === "brouillon" && <> · <b>{t("analyse_brouillon")}</b></>}
        </span>
        <span className="ligne-analyse-titre">{loc(a.titre)}</span>
        <span className="ligne-analyse-resume">{loc(a.resume)}</span>
      </Link>
    </li>
  );
}

/** Liste des dossiers thématiques, avec leurs vrais compteurs. */
export function ListeDossiers() {
  const { t } = useTranslation();
  return (
    <ul className="dossiers">
      {DOSSIERS.map((d) => {
        const n = analysesDuDossier(d.id).length;
        return (
          <li key={d.id}>
            <Link to={`/analyses/dossiers/${d.id}`}>
              <span className="dossiers-titre">{t(`dossier_${d.id}`)}</span>
              <span className="dossiers-desc">{t(`dossier_${d.id}_desc`)}</span>
              <span className="dossiers-compte nombre">
                {t("dossier_series", { count: d.indicateurs.length })} · {fmtPeriode(periodeDossier(d))}
                <br />
                {n === 0 ? t("dossier_aucune_analyse_court") : t("dossier_analyses", { count: n })}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Liste des publications institutionnelles (registre réel). */
export function ListePublications({ publications, compacte = false }) {
  const { t } = useTranslation();
  return (
    <ul className={`publications${compacte ? " publications--compacte" : ""}`}>
      {publications.map((p) => (
        <li key={p.id}>
          <a href={p.url} target="_blank" rel="noreferrer">
            <span className="publications-inst">{p.institution}</span>
            <span className="publications-titre">
              {p.titre}
              {p.edition && p.titre.indexOf(p.edition) === -1 ? `, ${p.edition}` : ""}
            </span>
            <span className="publications-meta">
              {t(`pub_type_${p.type}`)} · {p.format} · {t(`langue_${p.langue}`)} · {t("pub_officiel")} <span aria-hidden="true">↗</span>
            </span>
            {!compacte && <span className="publications-verif">{t("pub_verifie", { date: dateCourte(p.verifie_le) })}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// /analyses
// ---------------------------------------------------------------------------

export default function Analyses() {
  const { t } = useTranslation();
  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { label: t("nav_analyses") }]}
        titre={t("analyses_titre")}
        sousTitre={t("analyses_chapeau")}
        meta={[
          { label: t("analyses_meta_publiees"), valeur: String(ANALYSES.filter((a) => a.statut === "publiee").length) },
          { label: t("analyses_meta_dossiers"), valeur: String(DOSSIERS.length) },
        ]}
      />
      <section className="section section--compacte">
        <div className="conteneur colonnes-editoriales">
          <div>
            <h2 className="titre-colonne">{t("analyses_liste_titre")}</h2>
            {ANALYSES.length ? (
              <ul className="liste-analyses">{ANALYSES.map((a) => <LigneAnalyse key={a.id} a={a} />)}</ul>
            ) : (
              <p className="texte-sobre">{t("analyses_aucune")}</p>
            )}
            <p className="note">{t("analyses_regle")}</p>
          </div>
          <div>
            <h2 className="titre-colonne">{t("dossiers_titre")}</h2>
            <p className="texte-sobre">{t("dossiers_chapeau")}</p>
            <ListeDossiers />
          </div>
        </div>
      </section>
      <section className="section section--compacte section--fin">
        <div className="conteneur">
          <p className="renvoi-ligne">
            {t("analyses_vers_publications")} <Link to="/publications" className="lien-fleche">{t("nav_publications")} <span className="fleche">→</span></Link>
          </p>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// /analyses/dossiers/:id
// ---------------------------------------------------------------------------

export function Dossier() {
  const { id } = useParams();
  const { t } = useTranslation();
  const reduit = useMouvementReduit();
  const d = getDossier(id);
  const [indChoisi, setIndChoisi] = useState(null);
  if (!d) return <Introuvable />;

  const indicateurs = d.indicateurs.map(getIndicateur);
  const ind = indicateurs.find((i) => i.id === indChoisi) || indicateurs[0];
  const fin = ind.periode[1];
  const avecPays = ind.parPays && ind.unite !== "Mds FCFA";
  const series = { uemoa: serie(ind.id, UNION.id).filter((p) => p.annee > fin - 20) };
  const noms = { uemoa: t("zone_uemoa") };
  const criteres = CRITERES.filter((c) => d.criteres.includes(c.id));
  const analyses = analysesDuDossier(d.id);
  const publications = publicationsDuDossier(d.id);
  const ruptures = [...new Set(d.indicateurs.map(ruptureDe).filter(Boolean))];

  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { to: "/analyses", label: t("nav_analyses") }, { label: t(`dossier_${d.id}`) }]}
        surtitre={t("dossier_surtitre")}
        titre={t(`dossier_${d.id}`)}
        sousTitre={t(`dossier_${d.id}_desc`)}
        meta={[
          { label: t("dossier_meta_series"), valeur: String(d.indicateurs.length) },
          { label: t("meta_periode"), valeur: fmtPeriode(periodeDossier(d)) },
          { label: t("note_source"), valeur: "BCEAO · DBnomics" },
        ]}
      />

      <section className="section section--compacte">
        <div className="conteneur">
          <h2 className="titre-colonne">{t("dossier_series_titre")}</h2>
          <div className="defilant">
            <table className="tableau tableau-dossier">
              <thead>
                <tr>
                  <th scope="col">{t("col_indicateur")}</th>
                  <th scope="col">{t("meta_couverture")}</th>
                  <th scope="col">{t("meta_periode")}</th>
                  <th scope="col" className="num">{t("dossier_col_union")}</th>
                  <th scope="col">{t("dossier_col_tendance")}</th>
                </tr>
              </thead>
              <tbody>
                {indicateurs.map((i) => {
                  const s = serie(i.id, UNION.id);
                  const der = s.at(-1);
                  return (
                    <tr key={i.id}>
                      <th scope="row">
                        <Link to={`/donnees/${i.id}`}>{t(i.libelle)}</Link>
                        <small>
                          {libelleUnite(i.unite)}
                          {anneeRupture(i.id) && <span className="mention-rupture"> · {t("explo_rupture", { annee: anneeRupture(i.id) })}</span>}
                        </small>
                      </th>
                      <td>{i.parPays ? t("acc_meta_couverture", { n: PAYS.length }) : t("zone_uemoa")}</td>
                      <td className="nombre">{fmtPeriode(i.periode)}</td>
                      <td className="num nombre">{der ? `${fmtCourt(der.valeur, i.unite)} (${der.annee})` : "—"}</td>
                      <td>
                        <Apercu points={s.slice(-20)} rupture={anneeRupture(i.id)} label={t("explo_apercu", { zone: t("zone_uemoa"), periode: fmtPeriode([s.slice(-20)[0]?.annee, der?.annee]) })} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section--compacte">
        <div className="conteneur">
          <section className="visu">
            <div className="visu-tete">
              <div>
                <h2>{t("dossier_graph_titre", { indicateur: t(ind.libelle) })}</h2>
                <p>{t("zone_uemoa")} · {libelleUnite(ind.unite)}</p>
              </div>
              {indicateurs.length > 1 && (
                <div className="visu-outils">
                  <div className="bascule" role="group" aria-label={t("col_indicateur")}>
                    {indicateurs.map((i) => (
                      <button key={i.id} type="button" aria-pressed={i.id === ind.id} onClick={() => setIndChoisi(i.id)}>
                        {t(i.court)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="visu-corps">
              <GraphiqueSeries series={series} unite={ind.unite} noms={noms} hauteur={300} zero={ind.unite !== "Mds FCFA" && ind.unite !== "FCFA pour 1 USD"} animer={!reduit} rupture={anneeRupture(ind.id)} />
              <p className="legende">
                <span><i style={{ background: COULEUR_ZONE.uemoa }} /> {t("zone_uemoa")}</span>
                {anneeRupture(ind.id) && <span><i className="trait-rupture" /> {t("rupture_graph")}</span>}
              </p>
            </div>
            <dl className="visu-notes">
              <div>
                <dt>{t("note_source")}</dt>
                <dd>{t("source_bceao")}</dd>
              </div>
            </dl>
            <Link to={`/donnees/${ind.id}`} className="lien-fleche">
              {avecPays ? t("dossier_vers_fiche_pays") : t("dossier_vers_fiche")} <span className="fleche">→</span>
            </Link>
          </section>
        </div>
      </section>

      {(criteres.length > 0 || ruptures.length > 0) && (
        <section className="section section--compacte">
          <div className="conteneur colonnes-editoriales">
            {criteres.length > 0 && (
              <div>
                <h2 className="titre-colonne">{t("dossier_criteres_titre")}</h2>
                <ul className="liste-simple">
                  {criteres.map((c) => (
                    <li key={c.id}>
                      <b>{t(`conv_${c.id}`)}</b> {t(`conv_${c.id}_seuil`)}
                    </li>
                  ))}
                </ul>
                <Link to="/conjoncture/convergence" className="lien-fleche">{t("serie_convergence")} <span className="fleche">→</span></Link>
              </div>
            )}
            {ruptures.length > 0 && (
              <div>
                <h2 className="titre-colonne">{t("meth_ruptures_titre")}</h2>
                <ul className="liste-simple">
                  {ruptures.map((r) => (
                    <li key={r.id}>{t("rupture_resume", { annee: r.premiere_annee })}</li>
                  ))}
                </ul>
                <Link to="/methodologie#ruptures" className="lien-fleche">{t("rupture_lien_methodo")} <span className="fleche">→</span></Link>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section section--compacte section--fin">
        <div className="conteneur colonnes-editoriales">
          <div>
            <h2 className="titre-colonne">{t("analyses_liste_titre")}</h2>
            {analyses.length ? (
              <ul className="liste-analyses">{analyses.map((a) => <LigneAnalyse key={a.id} a={a} />)}</ul>
            ) : (
              <p className="texte-sobre">{t("dossier_aucune_analyse")}</p>
            )}
          </div>
          <div>
            <h2 className="titre-colonne">{t("pub_institutions_titre")}</h2>
            {publications.length ? <ListePublications publications={publications} compacte /> : <p className="texte-sobre">{t("dossier_aucune_publication")}</p>}
          </div>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// /analyses/:id
// ---------------------------------------------------------------------------

function BlocGraphique({ b }) {
  const { t } = useTranslation();
  const loc = useLoc();
  const reduit = useMouvementReduit();
  const ind = getIndicateur(b.indicateur);
  const series = Object.fromEntries(
    b.zones.map((z) => [z, serie(ind.id, z).filter((p) => (b.debut == null || p.annee >= b.debut) && (b.fin == null || p.annee <= b.fin))])
  );
  const noms = Object.fromEntries(b.zones.map((z) => [z, t(`zone_${z}`)]));
  return (
    <figure className="analyse-figure">
      {b.titre && <figcaption className="analyse-figure-titre">{loc(b.titre)}</figcaption>}
      <GraphiqueSeries series={series} unite={ind.unite} noms={noms} hauteur={320} zero={ind.unite !== "Mds FCFA"} animer={!reduit} rupture={anneeRupture(ind.id)} />
      <p className="legende">
        {b.zones.map((z) => (
          <span key={z}><i style={{ background: COULEUR_ZONE[z] }} /> {t(`zone_${z}`)}</span>
        ))}
        {anneeRupture(ind.id) && <span><i className="trait-rupture" /> {t("rupture_graph")}</span>}
      </p>
      <p className="note">
        {t(ind.libelle)} · {libelleUnite(ind.unite)} · {t("source_bceao")}{" "}
        <Link to={`/donnees/${ind.id}`}>{t("analyse_voir_serie")}</Link>
      </p>
    </figure>
  );
}

function BlocTableau({ b }) {
  const { t } = useTranslation();
  const loc = useLoc();
  const ind = getIndicateur(b.indicateur);
  return (
    <figure className="analyse-figure">
      {b.titre && <figcaption className="analyse-figure-titre">{loc(b.titre)}</figcaption>}
      <div className="defilant">
        <table className="tableau">
          <thead>
            <tr>
              <th scope="col">{t("col_pays")}</th>
              {b.annees.map((a) => (
                <th key={a} scope="col" className={`num nombre${a === anneeRupture(ind.id) ? " apres-rupture" : ""}`}>{a}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.zones.map((z) => (
              <tr key={z} className={z === "uemoa" ? "ligne-union" : undefined}>
                <th scope="row">{t(`zone_${z}`)}</th>
                {b.annees.map((a) => (
                  <td key={a} className={`num nombre${a === anneeRupture(ind.id) ? " apres-rupture" : ""}`}>{fmtCourt(valeur(ind.id, z, a), ind.unite)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">{t(ind.libelle)} · {libelleUnite(ind.unite)} · {t("source_bceao")}</p>
    </figure>
  );
}

export function Analyse() {
  const { id } = useParams();
  const { t } = useTranslation();
  const loc = useLoc();
  const a = getAnalyse(id);
  if (!a) return <Introuvable />;
  const publications = (a.publications || []).map(getPublication).filter(Boolean);

  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { to: "/analyses", label: t("nav_analyses") }, { to: `/analyses/dossiers/${a.dossier}`, label: t(`dossier_${a.dossier}`) }]}
        surtitre={t("analyse_surtitre")}
        titre={loc(a.titre)}
        sousTitre={loc(a.resume)}
        meta={[
          { label: t("analyse_meta_date"), valeur: dateCourte(a.date_publication) },
          { label: t("analyse_meta_auteurs"), valeur: a.auteurs.join(", ") },
          ...(a.validation?.par ? [{ label: t("analyse_meta_validation"), valeur: `${a.validation.par}, ${dateCourte(a.validation.le)}` }] : []),
          { label: t("analyse_meta_donnees"), valeur: dateCourte(a.donnees_au) },
        ]}
      />
      <article className="section section--compacte section--fin">
        <div className="conteneur analyse">
          {a.statut === "brouillon" && <p className="analyse-alerte">{t("analyse_brouillon_note")}</p>}
          {donneesPlusRecentes(a) && (
            <p className="analyse-alerte">{t("analyse_donnees_recentes", { date: dateCourte(a.donnees_au), maj: DATE_GENERATION ? fmtDate(DATE_GENERATION) : "" })}</p>
          )}
          <p className="analyse-question">
            <span>{t("analyse_question")}</span> {loc(a.question)}
          </p>

          {a.blocs.map((b, n) => {
            if (b.type === "graphique") return <BlocGraphique key={n} b={b} />;
            if (b.type === "tableau") return <BlocTableau key={n} b={b} />;
            if (b.type === "prix") {
              return (
                <figure key={n} className="analyse-figure">
                  {b.titre && <figcaption className="analyse-figure-titre">{loc(b.titre)}</figcaption>}
                  <MatieresPremieres produits={b.produits} depuis={b.depuis || "2019-01"} />
                  <NoteMatieres />
                </figure>
              );
            }
            const paragraphes = loc(b.contenu);
            return (
              <section key={n} className="analyse-texte">
                {b.titre && <h2>{loc(b.titre)}</h2>}
                {(Array.isArray(paragraphes) ? paragraphes : [paragraphes]).map((p, k) => <p key={k}>{p}</p>)}
              </section>
            );
          })}

          {a.observations?.length > 0 && (
            <section className="analyse-texte">
              <h2>{t("analyse_observations")}</h2>
              <ul>{a.observations.map((o, k) => <li key={k}>{loc(o)}</li>)}</ul>
            </section>
          )}
          {a.limites?.length > 0 && (
            <section className="analyse-texte">
              <h2>{t("analyse_limites")}</h2>
              <ul>{a.limites.map((o, k) => <li key={k}>{loc(o)}</li>)}</ul>
            </section>
          )}

          <section className="analyse-donnees">
            <h2>{t("analyse_donnees_utilisees")}</h2>
            <ul className="liste-simple">
              {(a.indicateurs || []).map((i) => {
                const ind = getIndicateur(i);
                const z = (a.zones || []).find((x) => x !== "uemoa" && zonesDe(i).some((y) => y.id === x));
                return (
                  <li key={i}>
                    <Link to={`/donnees/${i}${z ? `?pays=${z}` : ""}`}>{t(ind.libelle)}</Link> · {libelleUnite(ind.unite)} · <code>{ind.serie_bceao}</code>
                  </li>
                );
              })}
            </ul>
            {a.zones?.length > 0 && <p className="note">{t("analyse_zones")} : {a.zones.map((z) => t(`zone_${z}`)).join(", ")}</p>}
            <h2>{t("analyse_sources")}</h2>
            <ul className="liste-simple">
              {a.sources.map((s, k) => (
                <li key={k}>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.titre}</a> : s.titre}</li>
              ))}
            </ul>
            {publications.length > 0 && (
              <>
                <h2>{t("analyse_publications")}</h2>
                <ListePublications publications={publications} compacte />
              </>
            )}
            <Link to="/methodologie" className="lien-fleche">{t("nav_methodologie")} <span className="fleche">→</span></Link>
          </section>
        </div>
      </article>
    </>
  );
}
