import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DATE_GENERATION, SOURCES } from "../lib/meta.js";
import { fmtDate } from "../lib/format.js";
import { PAYS } from "../data/portail.js";

export default function Pied() {
  const { t } = useTranslation();
  return (
    <footer className="pied">
      <div className="conteneur pied-grille">
        <div className="pied-marque">
          <p>
            <b>{t("marque")}</b>
            <br />
            {t("mission")}
          </p>
        </div>
        <div>
          <p className="pied-titre">{t("pied_explorer")}</p>
          <Link to="/conjoncture">{t("nav_conjoncture")}</Link>
          <Link to="/conjoncture/convergence">{t("nav_convergence")}</Link>
          <Link to="/conjoncture/previsions">{t("nav_previsions")}</Link>
          <Link to="/analyses">{t("nav_analyses")}</Link>
          <Link to="/pays">{t("nav_pays")}</Link>
          <Link to="/donnees">{t("nav_donnees")}</Link>
          <Link to="/publications">{t("nav_publications")}</Link>
          <Link to="/methodologie">{t("nav_methodologie")}</Link>
        </div>
        <div>
          <p className="pied-titre">{t("nav_pays")}</p>
          {PAYS.map((p) => (
            <Link key={p.id} to={`/pays/${p.id}`}>
              {t(`zone_${p.id}`)}
            </Link>
          ))}
        </div>
        <div>
          <p className="pied-titre">{t("pied_donnees")}</p>
          <span>{t("pied_sources", { sources: SOURCES.join(" · ") })}</span>
          {DATE_GENERATION && <span>{t("pied_maj", { date: fmtDate(DATE_GENERATION) })}</span>}
          <span className="pied-note">{t("pied_note")}</span>
        </div>
      </div>
    </footer>
  );
}
