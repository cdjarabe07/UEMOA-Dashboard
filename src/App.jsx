import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import Entete from "./components/Entete.jsx";
import Pied from "./components/Pied.jsx";
import Accueil from "./pages/Accueil.jsx";
import ProfilPays, { ListePays } from "./pages/Pays.jsx";
import { Explorateur, FicheSerie } from "./pages/Donnees.jsx";
import Conjoncture from "./pages/Conjoncture.jsx";
import Analyses, { Analyse, Dossier } from "./pages/Analyses.jsx";
import Publications from "./pages/Publications.jsx";
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

// Anciennes adresses (avant la rubrique Données) : redirection permanente côté client.
function VersFicheSerie() {
  const { id } = useParams();
  const { search } = useLocation();
  return <Navigate to={`/donnees/${id}${search}`} replace />;
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
          <Route path="/conjoncture" element={<Conjoncture />} />
          <Route path="/conjoncture/convergence" element={<Convergence />} />
          <Route path="/conjoncture/previsions" element={<Previsions />} />
          <Route path="/analyses" element={<Analyses />} />
          <Route path="/analyses/dossiers/:id" element={<Dossier />} />
          <Route path="/analyses/:id" element={<Analyse />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/donnees" element={<Explorateur />} />
          <Route path="/donnees/:id" element={<FicheSerie />} />
          <Route path="/indicateurs" element={<Navigate to="/donnees" replace />} />
          <Route path="/indicateurs/:id" element={<VersFicheSerie />} />
          <Route path="/convergence" element={<Navigate to="/conjoncture/convergence" replace />} />
          <Route path="/previsions" element={<Navigate to="/conjoncture/previsions" replace />} />
          <Route path="/methodologie" element={<Methodologie />} />
          <Route path="*" element={<Introuvable />} />
        </Routes>
      </main>
      <Pied />
    </>
  );
}
