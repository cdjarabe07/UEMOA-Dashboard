// Journal des mises à jour : événements écrits par le pipeline
// (previsions-macro-uemoa/observatoire/journal.py). Les phrases sont composées
// ici à partir des champs ; aucune entrée n'est saisie à la main.
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import journal from "../data/journal.json";
import { getIndicateur } from "../data/portail.js";
import { fmtDate, fmtMois, fmtNombre } from "../lib/format.js";

export const JOURNAL = Array.isArray(journal) ? journal : [];

const date = (iso) => fmtDate(new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso));

function texte(e, t) {
  const nomZones = (zs) => zs.map((z) => t(`zone_${z}`)).join(", ");
  if (e.type === "donnees" && e.details.jeu === "pcps") {
    return t("journal_fmi_pcps", { n: e.indicateurs.length, mois: fmtMois(e.details.dernier_mois) });
  }
  if (e.type === "donnees" && e.details.jeu === "bm") {
    return t("journal_bm", { n: e.indicateurs.length, pays: e.zones.length });
  }
  if (e.type === "donnees" && e.details.jeu === "weo") {
    return t("journal_fmi_weo", { edition: e.details.edition, debut: e.details.premiere_annee, fin: e.details.derniere_annee, pays: e.zones.length });
  }
  if (e.type === "donnees") {
    const pays = e.zones.filter((z) => z !== "uemoa").length;
    return t("journal_donnees", { n: e.indicateurs.length, pays, fin: e.details.derniere_annee, obs: fmtNombre(e.details.observations) });
  }
  if (e.type === "previsions") {
    return t("journal_previsions", { zones: nomZones(e.zones), count: e.zones.length, n: e.indicateurs.length, debut: e.details.premiere_annee, fin: e.details.derniere_annee, obs: e.details.derniere_observation });
  }
  if (e.type === "methode" && e.details.nature === "rupture") {
    const ind = getIndicateur(e.indicateurs[0]);
    return t("journal_methode_rupture", { indicateur: ind ? t(ind.libelle) : e.indicateurs[0], annee: e.details.premiere_annee });
  }
  if (e.type === "serie") return t("journal_serie", { indicateur: e.indicateurs.map((i) => (getIndicateur(i) ? t(getIndicateur(i).libelle) : i)).join(", ") });
  return t(`journal_type_${e.type}`);
}

const lien = (e) =>
  e.details?.jeu === "bm" ? "/pays" : e.details?.jeu ? `/conjoncture#${e.details.jeu === "pcps" ? "international" : "projections"}` : e.type === "methode" ? "/methodologie#ruptures" : e.type === "previsions" ? "/conjoncture/previsions" : e.type === "donnees" ? "/donnees" : null;

export default function Journal({ limite = 5 }) {
  const { t } = useTranslation();
  if (!JOURNAL.length) return null;
  return (
    <ol className="journal">
      {JOURNAL.slice(0, limite).map((e) => (
        <li key={e.id}>
          <time dateTime={e.date}>{date(e.date)}</time>
          <span>
            <span className="journal-type">{t(`journal_type_${e.type}`)}</span>
            {lien(e) ? <Link to={lien(e)}>{texte(e, t)}</Link> : texte(e, t)}
          </span>
        </li>
      ))}
    </ol>
  );
}
