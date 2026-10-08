// Préférence « réduire les animations » du système, suivie en direct.
// Les durées CSS passent à 0 via theme.css ; ce hook sert aux animations
// pilotées en JavaScript (Recharts).
import { useEffect, useState } from "react";

const requete = () =>
  typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

export function useMouvementReduit() {
  const [reduit, setReduit] = useState(() => !!requete()?.matches);
  useEffect(() => {
    const mq = requete();
    if (!mq) return undefined;
    const maj = () => setReduit(mq.matches);
    mq.addEventListener("change", maj);
    return () => mq.removeEventListener("change", maj);
  }, []);
  return reduit;
}
