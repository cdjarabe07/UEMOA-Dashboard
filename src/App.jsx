import { useState } from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Accueil from "./pages/Accueil.jsx";
import Donnees from "./pages/Donnees.jsx";
import Methodologie from "./pages/Methodologie";
 
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
  return (
    <header className="site-nav">
      <Link to="/" className="site-brand">
        Observatoire Économique de l'UEMOA
      </Link>
      <nav>
        <NavLink to="/" end className="nav-link">Accueil</NavLink>
        <NavLink to="/donnees" className="nav-link">Données</NavLink>
        <NavLink to="/methodologie" className="nav-link">Méthodologie</NavLink>
      </nav>
      <div className="nav-right">
        <SelecteurLangue />
        <input type="text" className="search-bar" placeholder="Rechercher" />
      </div>
    </header>
  );
}

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/donnees" element={<Donnees />} />
        <Route path="/methodologie" element={<Methodologie />} />
      </Routes>
    </>
  );
}