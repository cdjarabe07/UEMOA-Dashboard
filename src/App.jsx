import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import Entete from "./components/Entete.jsx";
import Pied from "./components/Pied.jsx";
import Recherche from "./components/Recherche.jsx";
import Accueil from "./pages/Accueil.jsx";
import { useRevelation } from "./lib/revelation.js";

// Pages chargées à la demande : l'accueil s'ouvre sans attendre le reste du site.
const ListePays = lazy(() => import("./pages/Pays.jsx").then((m) => ({ default: m.ListePays })));
const ProfilPays = lazy(() => import("./pages/Pays.jsx"));
const Explorateur = lazy(() => import("./pages/Donnees.jsx").then((m) => ({ default: m.Explorateur })));
const FicheSerie = lazy(() => import("./pages/Donnees.jsx").then((m) => ({ default: m.FicheSerie })));
const Conjoncture = lazy(() => import("./pages/Conjoncture.jsx"));
const Analyses = lazy(() => import("./pages/Analyses.jsx"));
const Analyse = lazy(() => import("./pages/Analyses.jsx").then((m) => ({ default: m.Analyse })));
const Dossier = lazy(() => import("./pages/Analyses.jsx").then((m) => ({ default: m.Dossier })));
const Publications = lazy(() => import("./pages/Publications.jsx"));
const Previsions = lazy(() => import("./pages/Previsions.jsx"));
const Convergence = lazy(() => import("./pages/Convergence.jsx"));
const Methodologie = lazy(() => import("./pages/Methodologie.jsx"));
const Introuvable = lazy(() => import("./pages/Introuvable.jsx"));

// Anciennes adresses (avant la rubrique Données) : redirection permanente côté client.
function VersFicheSerie() {
  const { id } = useParams();
  const { search } = useLocation();
  return <Navigate to={`/donnees/${id}${search}`} replace />;
}

/**
 * Page affichée : remonte en haut (ou vers l'ancre visée, une fois la page chargée)
 * à l'arrivée, et révèle les sections au défilement.
 */
function Page({ children }) {
  const { hash } = useLocation();
  useRevelation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return undefined;
    }
    // La page peut être encore en chargement : on attend l'ancre quelques instants.
    let essais = 0;
    let id;
    const viser = () => {
      const cible = document.getElementById(hash.slice(1));
      if (cible) cible.scrollIntoView();
      else if (essais++ < 40) id = requestAnimationFrame(viser);
    };
    viser();
    return () => cancelAnimationFrame(id);
  }, [hash]);
  return children;
}

export default function App() {
  const location = useLocation();
  const reduit = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      <Entete />
      <Recherche />
      <main>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: reduit ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduit ? 0 : -6 }}
            transition={{ duration: reduit ? 0 : 0.22, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <Suspense fallback={<div className="chargement" aria-busy="true" />}>
              <Page>
                <Routes location={location}>
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
              </Page>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <Pied />
    </MotionConfig>
  );
}
