import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo } from "./Entete.jsx";
import { DATE_GENERATION } from "../lib/meta.js";
import { fmtDate } from "../lib/format.js";
import { PAYS } from "../data/portail.js";

export default function Pied() {
  const { t } = useTranslation();
  return (
    <footer className="pied">
      <div className="motif motif--filet" />
      <div className="conteneur pied-grille">
        <div className="pied-marque">
          <Logo />
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
          <Link to="/donnees">{t("nav_donnees")}</Link>
          <Link to="/publications">{t("nav_publications")}</Link>
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
          <p className="pied-titre">{t("pied_ressources")}</p>
          <Link to="/methodologie">{t("nav_methodologie")}</Link>
          <Link to="/methodologie#sources">{t("pied_methode_sources")}</Link>
          <Link to="/methodologie#ruptures">{t("pied_ruptures")}</Link>
          <Link to="/methodologie#previsions">{t("pied_previsions_methode")}</Link>
        </div>
      </div>
      <div className="pied-bas">
        <div className="conteneur pied-bas-grille">
          <span>{t("pied_sources", { sources: t("pied_sources_liste") })}</span>
          {DATE_GENERATION && <span className="nombre">{t("pied_maj", { date: fmtDate(DATE_GENERATION) })}</span>}
          <span>{t("pied_note")}</span>
          <span>{t("pied_photos")}</span>
        </div>
      </div>
    </footer>
  );
}
