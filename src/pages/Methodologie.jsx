import { useTranslation } from "react-i18next";
import CalendrierPublications from "./CalendrierPublications";
 
export default function Methodologie() {
  const { t } = useTranslation();
 
  return (
    <div className="page">
      <header className="hero">
        <p className="hero-eyebrow">{t("methodo_eyebrow")}</p>
        <h1 className="hero-title">{t("methodo_titre")}</h1>
      </header>
 
      <section>
        <h2>{t("methodo_source_titre")}</h2>
        <p>{t("methodo_source_texte")}</p>
 
        <h2>{t("methodo_modele_titre")}</h2>
        <p>{t("methodo_modele_texte")}</p>
 
        <h2>{t("methodo_limites_titre")}</h2>
        <p>{t("methodo_limites_texte1")}</p>
        <p>{t("methodo_limites_texte2")}</p>
 
        <h2>{t("methodo_fraicheur_titre")}</h2>
        <p>{t("methodo_fraicheur_texte")}</p>
      </section>
 
      <CalendrierPublications />
    </div>
  );
}