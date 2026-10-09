// Transitions discrètes : fondu court du contenu quand on change d'onglet, de pays
// ou d'indicateur, et fine barre de progression en haut de l'écran à chaque
// changement de page. Rien ne bouge si l'appareil demande de réduire les animations.
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";

/** Rejoue un fondu à chaque changement de cle (le contenu reste lisible : départ à 30 %). */
export default function Fondu({ cle, children, className }) {
  const reduit = useReducedMotion();
  if (reduit) return <div className={className}>{children}</div>;
  return (
    <motion.div
      key={cle}
      className={className}
      initial={{ opacity: 0.3, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Barre de progression affichée brièvement à chaque changement de page. */
export function BarreNavigation() {
  const { pathname } = useLocation();
  const reduit = useReducedMotion();
  const premier = useRef(true);
  const [tour, setTour] = useState(0);

  useEffect(() => {
    if (premier.current) {
      premier.current = false;
      return;
    }
    setTour((n) => n + 1);
  }, [pathname]);

  if (reduit || tour === 0) return null;
  return (
    <motion.div
      key={tour}
      className="barre-navigation"
      aria-hidden="true"
      initial={{ scaleX: 0, opacity: 1 }}
      animate={{ scaleX: [0, 0.7, 1], opacity: [1, 1, 0] }}
      transition={{ duration: 0.65, times: [0, 0.55, 1], ease: "easeOut" }}
    />
  );
}
