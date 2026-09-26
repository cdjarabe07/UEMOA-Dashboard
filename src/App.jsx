import { useState, useEffect } from "react";
import { Routes, Route, Link, NavLink, useLocation } from "react-router-dom";
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
        {t("brand_titre")}
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
    <footer className="site-footer-full">
      <div className="footer-columns">
        <div className="footer-brand-col">
          <h3>{t("brand_titre")}</h3>
          <p>{t("footer_texte")}</p>
        </div>
        <div className="footer-col">
          <h4>{t("footer_navigation")}</h4>
          <Link to="/">{t("accueil")}</Link>
          <Link to="/donnees">{t("donnees")}</Link>
          <Link to="/previsions">{t("nav_previsions")}</Link>
          <Link to="/comparaison">{t("nav_comparaison")}</Link>
        </div>
        <div className="footer-col">
          <h4>{t("footer_ressources")}</h4>
          <Link to="/methodologie">{t("methodologie")}</Link>
          <Link to="/donnees">{t("footer_exports")}</Link>
        </div>
        <div className="footer-col">
          <h4>{t("footer_sources")}</h4>
          <span>BCEAO</span>
          <span>DBnomics</span>
        </div>
        <div className="footer-col">
          <h4>{t("footer_datemaj")}</h4>
          <span>{dateMaj ? `${dateMaj} UTC` : t("comparer_nd")}</span>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} {t("brand_titre")} · {t("footer_mention")}
      </div>
    </footer>
  );
}

// Remonte en haut de page à chaque changement de route.
function RetourHaut() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <RetourHaut />
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/donnees" element={<Donnees />} />
          <Route path="/previsions" element={<PrevisionsSimulations />} />
          <Route path="/comparaison" element={<CartePays />} />
          <Route path="/methodologie" element={<Methodologie />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}