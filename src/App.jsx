import { Routes, Route, Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Accueil from "./pages/Accueil.jsx";
import Donnees from "./pages/Donnees.jsx";
import Methodologie from "./pages/Methodologie";

function NavBar() {
  const { i18n } = useTranslation();

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
      <div className="lang-switcher">
        <button onClick={() => i18n.changeLanguage("fr")}>FR</button>
        <button onClick={() => i18n.changeLanguage("en")}>EN</button>
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