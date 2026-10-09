import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PAYS, UNION, INDICATEURS, FAMILLES, getIndicateur, serie, valeur, derniereAnnee, anneeRupture, ruptureDe } from "../data/portail.js";
import { CRITERES, respecte } from "../lib/convergence.js";
import { pointsAttention } from "../lib/attention.js";
import { DATE_GENERATION } from "../lib/meta.js";
import { fmtCourt, fmtDate, fmtNombre, fmtPeriode, fmtValeur, libelleUnite } from "../lib/format.js";
import { populationUnion } from "../data/banque_mondiale.js";
import { exporterCSV } from "../lib/export.js";
import { ANALYSES, PUBLICATIONS } from "../contenu/index.js";
import CarteUEMOA, { LegendeCarte } from "../components/CarteUEMOA.jsx";
import Apercu from "../components/Apercu.jsx";
import Journal from "../components/Journal.jsx";
import BandeauChiffres from "../components/BandeauChiffres.jsx";
import HerosPhotos from "../components/HerosPhotos.jsx";
import { LigneAnalyse, ListeDossiers, ListePublications } from "../components/ListesContenu.jsx";

// Entrée du grand visuel : surtitre, titre, phrase et boutons en cascade.
const HEROS = {
  cache: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.7, 0.2, 1] } },
};

// Indicateurs de la conjoncture de l'Union, dans l'ordre de lecture.
const CLES = ["croissance_reelle", "inflation", "solde_budgetaire_pib", "dette_pib", "pression_fiscale", "balance_courante_pib"];
// Indicateurs proposés sur la carte des pays.
const CARTE = ["croissance_reelle", "inflation", "solde_budgetaire_pib", "dette_pib", "pression_fiscale"];

const critereDe = (id) => CRITERES.find((c) => c.indicateur === id) || null;
const symbole = (c) => (c.sens === "<=" ? "≤" : "≥");

/** Lecture factuelle de l'Union : phrases fixes, valeurs lues dans les séries. */
function LectureUnion({ annee }) {
  const { t } = useTranslation();
  const v = (id, a = annee) => valeur(id, UNION.id, a);
  const pct = (x) => fmtValeur(x, "%");
  const pib = (x) => fmtValeur(Math.abs(x), "% du PIB");
  const phrases = [];
  if (v("croissance_reelle") != null) {
    phrases.push(t("acc_lecture_croissance", { annee, v: pct(v("croissance_reelle")), avant: pct(v("croissance_reelle", annee - 1)), anneeAvant: annee - 1 }));
  }
  const inf = v("inflation");
  if (inf != null) {
    const c = critereDe("inflation");
    const position = inf > c.seuil ? "dessus" : inf < c.seuil ? "dessous" : "egal";
    phrases.push(t(`acc_lecture_inflation_${position}`, { v: pct(inf), avant: pct(v("inflation", annee - 1)), anneeAvant: annee - 1, seuil: pct(c.seuil) }));
  }
  const solde = v("solde_budgetaire_pib");
  const courant = v("balance_courante_pib");
  if (solde != null && courant != null) {
    phrases.push(
      t("acc_lecture_soldes", {
        solde: t(solde < 0 ? "acc_deficit_budgetaire" : "acc_excedent_budgetaire", { v: pib(solde) }),
        soldeAvant: pct(Math.abs(v("solde_budgetaire_pib", annee - 1))),
        courant: t(courant < 0 ? "acc_deficit_courant" : "acc_excedent_courant", { v: pib(courant) }),
        courantAvant: pct(Math.abs(v("balance_courante_pib", annee - 1))),
        anneeAvant: annee - 1,
      })
    );
  }
  return (
    <div className="lecture-union">
      {phrases.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}

/** Texte d'un point d'attention (règles de lib/attention.js). */
function texteAttention(p, t) {
  const nom = (z) => t(`zone_${z}`);
  const ind = getIndicateur(p.indicateur);
  if (p.regle === "dette") {
    return {
      texte: t("att_dette", { annee: p.annee, pays: p.pays.map((x) => `${nom(x.id)} (${fmtCourt(x.v, ind.unite)})`).join(", ") }),
      regle: t("att_regle_dette", { annee: anneeRupture("dette_pib") }),
      lien: `/donnees/dette_pib?pays=${p.pays[0].id}`,
    };
  }
  if (p.regle === "solde") {
    return {
      texte: t("att_solde", {
        annee: p.annee,
        count: p.conformes.length,
        n: p.conformes.length,
        total: p.total,
        liste: p.conformes.length ? ` (${p.conformes.map((x) => nom(x.id)).join(", ")})` : "",
        pire: nom(p.pire.id),
        v: fmtCourt(p.pire.v, ind.unite),
      }),
      regle: t("att_regle_solde"),
      lien: `/donnees/solde_budgetaire_pib?pays=${p.pire.id}`,
    };
  }
  if (p.regle === "inflation") {
    return {
      texte: t("att_inflation", { annee: p.annee, pays: nom(p.id), v: fmtCourt(p.v, ind.unite), avant: fmtCourt(p.avant, ind.unite), anneeAvant: p.annee - 1 }),
      regle: t("att_regle_inflation"),
      lien: `/donnees/inflation?pays=${p.id}`,
    };
  }
  return {
    texte: `${t("att_pression", { debut: p.debut, annee: p.annee, pays: p.pays.map(nom).join(", ") })}${p.aucunAuSeuil ? ` ${t("att_pression_seuil")}` : ""}`,
    regle: t("att_regle_pression"),
    lien: `/donnees/pression_fiscale?pays=${p.pays[0]}`,
  };
}

/** Toutes les séries du portail, au format long, avec la mention des ruptures. */
function telechargerTout(t) {
  const lignes = [];
  for (const ind of INDICATEURS) {
    const r = ruptureDe(ind.id);
    for (const z of [UNION, ...PAYS]) {
      for (const p of serie(ind.id, z.id)) {
        lignes.push({
          indicateur: ind.id,
          libelle: t(ind.libelle),
          unite: ind.unite,
          zone: z.id,
          annee: p.annee,
          valeur: p.valeur,
          serie: ind.serie_bceao.replace("<zone>", z.code_bceao),
          note: r && p.annee < r.premiere_annee ? t("csv_note_rupture", { annee: r.premiere_annee }) : "",
        });
      }
    }
  }
  const colonnes = ["indicateur", "libelle", "unite", "zone", "annee", "valeur", "serie", "note"].map((c) => ({ cle: c, titre: c }));
  exporterCSV("observatoire_uemoa_series", colonnes, lignes);
  return lignes.length;
}

export default function Accueil() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [indCarte, setIndCarte] = useState("croissance_reelle");
  const [survol, setSurvol] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [retour, setRetour] = useState("");
  const [classementAnime] = useAutoAnimate({ duration: 320 });

  const annee = Math.min(...CLES.map(derniereAnnee));
  const ind = getIndicateur(indCarte);
  const anCarte = derniereAnnee(indCarte);
  const valeurs = Object.fromEntries(PAYS.map((p) => [p.id, valeur(indCarte, p.id, anCarte)]));
  const classement = PAYS.map((p) => ({ id: p.id, v: valeurs[p.id] }))
    .filter((x) => x.v != null)
    .sort((a, b) => b.v - a.v);
  const attention = pointsAttention().map((p) => texteAttention(p, t));
  const debut = Math.min(...INDICATEURS.map((i) => i.periode[0]));
  const fin = Math.max(...INDICATEURS.map((i) => i.periode[1]));
  const analyses = ANALYSES.filter((a) => a.statut === "publiee").slice(0, 3);
  const popUnion = populationUnion();

  const lancerRecherche = (e) => {
    e.preventDefault();
    navigate(recherche.trim() ? `/donnees?q=${encodeURIComponent(recherche.trim())}` : "/donnees");
  };
  const telecharger = () => {
    const n = telechargerTout(t);
    setRetour(t("acc_dl_ok", { n: n.toLocaleString() }));
    setTimeout(() => setRetour(""), 3500);
  };

  return (
    <>
      {/* Grand visuel */}
      <section className="heros">
        <HerosPhotos />
        <motion.div
          className="conteneur heros-contenu"
          initial="cache"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
        >
          <motion.p className="heros-surtitre" variants={HEROS}>{t("acc_surtitre")}</motion.p>
          <motion.h1 variants={HEROS}>{t("acc_titre")}</motion.h1>
          <motion.p className="heros-phrase" variants={HEROS}>{t("mission")}</motion.p>
          <motion.div className="heros-actions" variants={HEROS}>
            <Link to="/donnees" className="bouton bouton--plein">
              {t("acc_cta_donnees")} <ArrowRight size={16} />
            </Link>
            <Link to="/pays" className="bouton bouton--clair">
              {t("acc_cta_pays")}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <BandeauChiffres />

      {/* A. L'Observatoire */}
      <section className="acc-section acc-intro">
        <div className="conteneur acc-intro-grille">
          <div className="acc-intro-texte">
            <div>
              <p className="surtitre">{t("acc_q_observatoire")}</p>
              <h2>{t("marque")}</h2>
            </div>
            <p className="acc-chapeau">{t("acc_presentation")}</p>
            <ul className="acc-fonctions">
              <li><Link to="/conjoncture">{t("acc_fn_conjoncture")}</Link></li>
              <li><Link to="/conjoncture/convergence">{t("acc_fn_convergence")}</Link></li>
              <li><Link to="/pays">{t("acc_fn_pays")}</Link></li>
              <li><Link to="/donnees">{t("acc_fn_donnees")}</Link></li>
              <li><Link to="/analyses">{t("acc_fn_analyses")}</Link></li>
              <li><Link to="/publications">{t("acc_fn_publications")}</Link></li>
            </ul>
            <dl className="acc-perimetre">
              <div><dt>{t("acc_per_pays")}</dt><dd>{t("acc_meta_couverture", { n: PAYS.length })}</dd></div>
              {popUnion && (
                <div>
                  <dt>{t("acc_per_population", { annee: popUnion.annee })}</dt>
                  <dd className="nombre">{t("acc_population_val", { n: fmtNombre(popUnion.total / 1e6, 1, true) })}</dd>
                </div>
              )}
              <div><dt>{t("acc_per_indicateurs")}</dt><dd className="nombre">{INDICATEURS.length} · {t("acc_per_themes", { n: FAMILLES.length })}</dd></div>
              <div><dt>{t("meta_periode")}</dt><dd className="nombre">{fmtPeriode([debut, fin])}</dd></div>
              <div><dt>{t("note_source")}</dt><dd>BCEAO · DBnomics</dd></div>
              {DATE_GENERATION && <div><dt>{t("meta_maj")}</dt><dd className="nombre">{fmtDate(DATE_GENERATION)}</dd></div>}
            </dl>
          </div>
          <figure className="acc-carte-situation">
            <CarteUEMOA survol={survol} setSurvol={setSurvol} label={t("acc_carte_situation")} />
            <figcaption className="note">{t("acc_carte_legende")}</figcaption>
          </figure>
        </div>
      </section>

      {/* B. Conjoncture en bref */}
      <section className="acc-section">
        <div className="conteneur">
          <div className="acc-tete">
            <div>
              <p className="surtitre">{t("acc_q_conjoncture")}</p>
              <h2>{t("acc_conjoncture_titre", { annee })}</h2>
            </div>
            <Link to="/conjoncture" className="lien-fleche">{t("acc_conjoncture_lien")} <span className="fleche">→</span></Link>
          </div>
          <LectureUnion annee={annee} />
          <div className="defilant">
            <table className="tableau tableau-synthese acc-tableau">
              <thead>
                <tr>
                  <th scope="col">{t("zone_uemoa")}</th>
                  {[annee - 2, annee - 1, annee].map((a) => (
                    <th key={a} scope="col" className={`num nombre${a === annee - 2 ? " acc-col-secondaire" : ""}`}>{a}</th>
                  ))}
                  <th scope="col">{t("conj_col_critere")}</th>
                  <th scope="col" className="acc-col-secondaire">{t("acc_col_tendance", { debut: annee - 9, fin: annee })}</th>
                </tr>
              </thead>
              <tbody>
                {CLES.map((id) => {
                  const i = getIndicateur(id);
                  const c = critereDe(id);
                  const v = valeur(id, UNION.id, annee);
                  const ok = c ? respecte(c, v, annee) : null;
                  const points = serie(id, UNION.id).filter((p) => p.annee > annee - 10 && p.annee <= annee);
                  return (
                    <tr key={id}>
                      <th scope="row">
                        <Link to={`/donnees/${id}`}>{t(i.court)}</Link>
                        <small>
                          {libelleUnite(i.unite)}
                          {anneeRupture(id) && <span className="mention-rupture"> · {t("acc_comparable_depuis", { annee: anneeRupture(id) })}</span>}
                        </small>
                      </th>
                      {[annee - 2, annee - 1, annee].map((a) => (
                        <td key={a} className={`num nombre${a === annee ? " valeur-courante" : ""}${a === annee - 2 ? " acc-col-secondaire" : ""}`}>
                          {fmtCourt(valeur(id, UNION.id, a), i.unite)}
                        </td>
                      ))}
                      <td className={ok === true ? "critere-ok" : ok === false ? "critere-ko" : undefined}>
                        {c ? `${symbole(c)} ${fmtCourt(c.seuil, i.unite)} · ${ok ? t("serie_critere_ok") : t("serie_critere_ko")}` : "—"}
                      </td>
                      <td className="acc-col-secondaire">
                        <Apercu points={points} rupture={anneeRupture(id)} label={t("explo_apercu", { zone: t("zone_uemoa"), periode: fmtPeriode([points[0]?.annee, points.at(-1)?.annee]) })} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="note">{t("acc_conjoncture_source", { date: DATE_GENERATION ? fmtDate(DATE_GENERATION) : "—" })}</p>
          <p className="acc-renvoi-international">
            <Link to="/conjoncture#international" className="lien-fleche">{t("acc_international_lien")} <span className="fleche">→</span></Link>
          </p>
        </div>
      </section>

      {/* C. Les pays */}
      <section className="acc-section acc-section--sable">
        <div className="conteneur">
          <div className="acc-tete">
            <div>
              <p className="surtitre">{t("acc_q_pays")}</p>
              <h2>{t("acc_pays_titre", { annee: anCarte })}</h2>
            </div>
            <label className="selecteur selecteur--ligne" htmlFor="acc-indicateur">
              <span>{t("col_indicateur")}</span>
              <select id="acc-indicateur" value={indCarte} onChange={(e) => setIndCarte(e.target.value)}>
                {CARTE.map((id) => (
                  <option key={id} value={id}>{t(getIndicateur(id).court)} ({libelleUnite(getIndicateur(id).unite)})</option>
                ))}
              </select>
            </label>
          </div>
          <div className="acc-pays-grille">
            <figure className="acc-carte">
              <CarteUEMOA valeurs={valeurs} unite={ind.unite} survol={survol} setSurvol={setSurvol} label={t("acc_carte_valeurs", { indicateur: t(ind.court), annee: anCarte })} />
              <figcaption>
                <LegendeCarte valeurs={valeurs} unite={ind.unite} annee={anCarte} />
                <span className="note">{t("acc_carte_aide")}</span>
              </figcaption>
            </figure>
            <div>
              <ol className="classement" ref={classementAnime}>
                {classement.map((x, n) => (
                  <li key={x.id}>
                    <Link
                      to={`/pays/${x.id}`}
                      className={survol === x.id ? "actif" : undefined}
                      onMouseEnter={() => setSurvol(x.id)}
                      onMouseLeave={() => setSurvol(null)}
                      onFocus={() => setSurvol(x.id)}
                      onBlur={() => setSurvol(null)}
                    >
                      <span className="classement-rang nombre">{n + 1}</span>
                      <span>{t(`zone_${x.id}`)}</span>
                      <span className="classement-valeur nombre">{fmtCourt(x.v, ind.unite)}</span>
                      <span className="fleche" aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
                <li className="classement-union">
                  <Link to={`/donnees/${indCarte}`}>
                    <span className="classement-rang" />
                    <span>{t("zone_uemoa")}</span>
                    <span className="classement-valeur nombre">{fmtCourt(valeur(indCarte, UNION.id, anCarte), ind.unite)}</span>
                    <span className="fleche" aria-hidden="true">→</span>
                  </Link>
                </li>
              </ol>
              <p className="note">
                {t("acc_classement_note", { unite: libelleUnite(ind.unite), annee: anCarte })} {t("source_bceao")}
                {anneeRupture(indCarte) && ` ${t("acc_comparable_depuis_long", { annee: anneeRupture(indCarte) })}`}
              </p>
              <Link to="/pays" className="lien-fleche">{t("acc_pays_lien")} <span className="fleche">→</span></Link>
            </div>
          </div>

          {attention.length > 0 && (
            <div className="acc-attention">
              <div className="acc-tete acc-tete--petite">
                <h3>{t("acc_attention_titre")}</h3>
                <Link to="/methodologie#attention" className="note">{t("acc_attention_regles")}</Link>
              </div>
              <ul className="attention">
                {attention.map((a) => (
                  <li key={a.texte}>
                    <Link to={a.lien}>
                      <span>
                        {a.texte}
                        <span className="attention-regle">{a.regle}</span>
                      </span>
                      <span className="fleche" aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* D. Analyses et publications */}
      <section className="acc-section">
        <div className="conteneur">
          <div className="acc-tete">
            <div>
              <p className="surtitre">{t("acc_q_approfondir")}</p>
              <h2>{t("acc_approfondir_titre")}</h2>
            </div>
          </div>
          <div className="colonnes-editoriales">
            <div>
              {analyses.length > 0 && (
                <>
                  <div className="titre-colonne-ligne">
                    <h3 className="titre-colonne">{t("analyses_liste_titre")}</h3>
                    <Link to="/analyses" className="lien-fleche">{t("acc_toutes")} <span className="fleche">→</span></Link>
                  </div>
                  <ul className="liste-analyses">{analyses.map((a) => <LigneAnalyse key={a.id} a={a} />)}</ul>
                </>
              )}
              <div className="titre-colonne-ligne">
                <h3 className="titre-colonne">{t("dossiers_titre")}</h3>
                <Link to="/analyses" className="lien-fleche">{t("nav_analyses")} <span className="fleche">→</span></Link>
              </div>
              <ListeDossiers />
            </div>
            <div>
              <div className="titre-colonne-ligne">
                <h3 className="titre-colonne">{t("pub_institutions_titre")}</h3>
                <Link to="/publications" className="lien-fleche">{t("acc_toutes")} <span className="fleche">→</span></Link>
              </div>
              <ListePublications publications={PUBLICATIONS.slice(0, 4)} compacte />
              <p className="note">{t("acc_pub_note")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* E. Données et mises à jour */}
      <section className="acc-section">
        <div className="conteneur">
          <div className="acc-tete">
            <div>
              <p className="surtitre">{t("acc_q_donnees")}</p>
              <h2>{t("acc_donnees_titre")}</h2>
            </div>
            <Link to="/donnees" className="lien-fleche">{t("acc_donnees_lien")} <span className="fleche">→</span></Link>
          </div>
          <div className="colonnes-editoriales">
            <div>
              <form className="explo-recherche" role="search" onSubmit={lancerRecherche}>
                <label htmlFor="acc-recherche" className="visuellement-cache">{t("explo_recherche")}</label>
                <input id="acc-recherche" type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder={t("explo_recherche_ph")} autoComplete="off" />
                <button type="submit" className="bouton bouton--petit">{t("acc_rechercher")}</button>
              </form>
              <ul className="themes">
                {FAMILLES.map((f) => {
                  const inds = INDICATEURS.filter((i) => i.famille === f);
                  if (!inds.length) return null;
                  return (
                    <li key={f}>
                      <Link to={`/donnees?theme=${f}`}>
                        <span>{t(`famille_${f}`)}</span>
                        <span className="themes-meta nombre">{t("dossier_series", { count: inds.length })}</span>
                        <span className="themes-meta nombre">{fmtPeriode([Math.min(...inds.map((i) => i.periode[0])), Math.max(...inds.map((i) => i.periode[1]))])}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <button type="button" className="bouton bouton--plein" onClick={telecharger}>{t("acc_dl_tout")}</button>
              <p className="retour" role="status" aria-live="polite">{retour}</p>
            </div>
            <div>
              <h3 className="titre-colonne">{t("acc_journal_titre")}</h3>
              <Journal />
              <p className="note">{t("acc_journal_note")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* F. Sources et méthode */}
      <section className="acc-section acc-section--sable">
        <div className="conteneur">
          <div className="acc-tete">
            <div>
              <p className="surtitre">{t("acc_q_methode")}</p>
              <h2>{t("acc_methode_titre")}</h2>
            </div>
            <Link to="/methodologie" className="lien-fleche">{t("nav_methodologie")} <span className="fleche">→</span></Link>
          </div>
          <div className="acc-methode">
            <div>
              <h3>{t("acc_methode_sources_titre")}</h3>
              <p>{t("acc_methode_sources")}</p>
              <Link to="/methodologie#sources" className="lien-fleche">{t("acc_methode_lien_sources")} <span className="fleche">→</span></Link>
            </div>
            <div>
              <h3>{t("acc_methode_controles_titre")}</h3>
              <p>{t("acc_methode_controles")}</p>
              <Link to="/methodologie#ruptures" className="lien-fleche">{t("acc_methode_lien_controles")} <span className="fleche">→</span></Link>
            </div>
            <div>
              <h3>{t("acc_methode_previsions_titre")}</h3>
              <p>{t("acc_methode_previsions")}</p>
              <Link to="/methodologie#previsions" className="lien-fleche">{t("acc_methode_lien_previsions")} <span className="fleche">→</span></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
