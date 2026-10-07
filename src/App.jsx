import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Entete from "./components/Entete.jsx";
import Pied from "./components/Pied.jsx";
import Accueil from "./pages/Accueil.jsx";
import ProfilPays, { ListePays } from "./pages/Pays.jsx";
import FicheIndicateur, { ListeIndicateurs } from "./pages/Indicateurs.jsx";
import Previsions from "./pages/Previsions.jsx";
import Convergence from "./pages/Convergence.jsx";
import Methodologie from "./pages/Methodologie.jsx";
import Introuvable from "./pages/Introuvable.jsx";

// Remonte en haut de page à chaque changement de route, ou vers l'ancre visée.
function Defilement() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const cible = document.getElementById(hash.slice(1));
      if (cible) {
        cible.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <Defilement />
      <Entete />
      <main>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/pays" element={<ListePays />} />
          <Route path="/pays/:id" element={<ProfilPays />} />
          <Route path="/indicateurs" element={<ListeIndicateurs />} />
          <Route path="/indicateurs/:id" element={<FicheIndicateur />} />
          <Route path="/convergence" element={<Convergence />} />
          <Route path="/previsions" element={<Previsions />} />
          <Route path="/methodologie" element={<Methodologie />} />
          <Route path="*" element={<Introuvable />} />
        </Routes>
      </main>
      <Pied />
    </>
  );
}
