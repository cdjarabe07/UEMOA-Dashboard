import { Routes, Route, Link, NavLink } from "react-router-dom";
import Accueil from "./pages/Accueil.jsx";
import Donnees from "./pages/Donnees.jsx";

function NavBar() {
  return (
    <header className="site-nav">
      <Link to="/" className="site-brand">
        Observatoire Économique de l'UEMOA
      </Link>
      <nav>
        <NavLink to="/" end className="nav-link">Accueil</NavLink>
        <NavLink to="/donnees" className="nav-link">Données</NavLink>
      </nav>
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
      </Routes>
    </>
  );
}