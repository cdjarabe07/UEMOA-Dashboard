import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PUBLICATIONS } from "../contenu/index.js";
import Bandeau from "../components/Bandeau.jsx";
import { ListePublications } from "../components/ListesContenu.jsx";

/** /publications : documents réels des institutions, avec lien officiel. */
export default function Publications() {
  const { t } = useTranslation();
  const institutions = [...new Set(PUBLICATIONS.map((p) => p.institution))];
  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { label: t("nav_publications") }]}
        titre={t("pub_titre")}
        sousTitre={t("pub_chapeau")}
        meta={[
          { label: t("pub_meta_documents"), valeur: String(PUBLICATIONS.length) },
          { label: t("pub_meta_institutions"), valeur: institutions.map((i) => t(`institution_${i}`, { defaultValue: i })).join(" · ") || "—" },
        ]}
      />
      <section className="section section--compacte section--fin">
        <div className="conteneur colonnes-editoriales">
          <div>
            <h2 className="titre-colonne">{t("pub_institutions_titre")}</h2>
            {PUBLICATIONS.length ? <ListePublications publications={PUBLICATIONS} /> : <p className="texte-sobre">{t("pub_aucune")}</p>}
          </div>
          <div className="pub-regles">
            <h2 className="titre-colonne">{t("pub_regles_titre")}</h2>
            <ul className="liste-simple">
              <li>{t("pub_regle_1")}</li>
              <li>{t("pub_regle_2")}</li>
              <li>{t("pub_regle_3")}</li>
            </ul>
            <p className="renvoi-ligne">
              {t("pub_vers_analyses")} <Link to="/analyses" className="lien-fleche">{t("nav_analyses")} <span className="fleche">→</span></Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
