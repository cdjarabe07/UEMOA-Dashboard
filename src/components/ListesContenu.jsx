// Listes légères de contenus (analyses, dossiers, publications) partagées par
// l'accueil et la rubrique Analyses, sans dépendance aux graphiques.
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fmtDate, fmtPeriode } from "../lib/format.js";
import { DOSSIERS, analysesDuDossier, periodeDossier } from "../contenu/index.js";

// Texte bilingue d'un contenu : { fr, en } -> langue active (repli sur le français).
export const useLoc = () => {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith("en");
  return (v) => (v == null ? "" : typeof v === "string" ? v : (en && v.en) || v.fr);
};

export const dateCourte = (iso) => fmtDate(new Date(`${iso}T00:00:00Z`));

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
            <span className="publications-inst">{t(`institution_${p.institution}`, { defaultValue: p.institution })}</span>
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
