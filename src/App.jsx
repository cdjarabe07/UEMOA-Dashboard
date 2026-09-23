import { useState } from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Accueil from "./pages/Accueil.jsx";
import Donnees from "./pages/Donnees.jsx";
import Methodologie from "./pages/Methodologie";
import PrevisionsSimulations from "./pages/PrevisionsSimulations";
import CartePays from "./pages/CartePays";
import metaData from "./data/meta.json";

function SelecteurLangue() {
  const { i18n } = useTranslation();
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className="lang-dropdown-wrapper">
      <button className="lang-dropdown" onClick={() => setOuvert(!ouvert)}>
        {i18n.language.toUpperCase()} ▾
      </button>
      {ouvert && (
        <div className="lang-menu">
          {i18n.language !== "fr" && (
            <button onClick={() => { i18n.changeLanguage("fr"); setOuvert(false); }}>FR</button>
          )}
          {i18n.language !== "en" && (
            <button onClick={() => { i18n.changeLanguage("en"); setOuvert(false); }}>EN</button>
          )}
        </div>
      )}
    </div>
  );
}

function NavBar() {
  const { t } = useTranslation();
  return (
    <header className="site-nav">
      <Link to="/" className="site-brand">
        <span className="site-brand-title">{t("brand_titre")}</span>
        <span className="site-brand-sub">{t("brand_sous_titre")}</span>
      </Link>
      <nav aria-label={t("nav_label")}>
        <NavLink to="/" end className="nav-link">{t("accueil")}</NavLink>
        <NavLink to="/donnees" className="nav-link">{t("donnees")}</NavLink>
        <NavLink to="/previsions" className="nav-link">{t("nav_previsions")}</NavLink>
        <NavLink to="/comparaison" className="nav-link">{t("nav_comparaison")}</NavLink>
        <NavLink to="/methodologie" className="nav-link">{t("methodologie")}</NavLink>
      </nav>
      <div className="nav-right">
        <SelecteurLangue />
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useTranslation();
  let dateMaj = null;
  if (metaData && typeof metaData.generated_at === "string") {
    const d = new Date(metaData.generated_at);
    if (!Number.isNaN(d.getTime())) {
      dateMaj = d.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });
    }
  }
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <span>{t("brand_titre")}</span>
        <span className="app-footer-links">
          <Link to="/donnees">{t("footer_donnees")}</Link>
          <Link to="/methodologie">{t("footer_metho")}</Link>
          {dateMaj && <span>{t("footer_datemaj")} : {dateMaj} UTC</span>}
        </span>
        <span>{t("footer_sources")} : BCEAO · DBnomics</span>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/donnees" element={<Donnees />} />
          <Route path="/previsions" element={<div className="page"><PrevisionsSimulations /></div>} />
          <Route path="/comparaison" element={<div className="page"><CartePays /></div>} />
          <Route path="/methodologie" element={<Methodologie />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}