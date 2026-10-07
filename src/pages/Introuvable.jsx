import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Introuvable() {
  const { t } = useTranslation();
  return (
    <header className="page-tete introuvable">
      <div className="conteneur">
        <p className="surtitre">404</p>
        <h1>{t("introuvable_titre")}</h1>
        <p className="chapeau">{t("introuvable_texte")}</p>
        <Link to="/" className="bouton bouton--plein">{t("introuvable_lien")}</Link>
      </div>
    </header>
  );
}
