// Révélation des sections au défilement (Motion) : chaque section située sous la
// ligne de flottaison apparaît en fondu montant quand elle entre à l'écran, et ses
// éléments répétés (cartes, lignes de liste) suivent en cascade. Les sections déjà
// visibles au chargement ne bougent pas ; rien ne bouge si l'appareil demande de
// réduire les animations. Les sections des pages chargées à la demande sont prises
// en compte dès leur arrivée dans le DOM.
import { useEffect } from "react";
import { animate, inView, stagger } from "motion";

const SECTIONS = ".section, .acc-section, .visu, .note-rupture";
const ENFANTS = [
  ".mp-grille > li",
  ".cartes-pays > li",
  ".dossiers > li",
  ".attention > li",
  ".journal > li",
  ".publications > li",
  ".liste-analyses > li",
  ".themes > li",
  ".renvois > *",
  ".acc-methode > div",
  ".classement > li",
].join(", ");
const EASE = [0.2, 0.7, 0.2, 1];

const reduit = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function useRevelation() {
  useEffect(() => {
    if (reduit()) return undefined;
    const main = document.querySelector("main");
    if (!main) return undefined;
    const vus = new WeakSet();
    const arrets = [];
    const enAttente = new Set();

    const reveler = (el) => {
      if (!enAttente.delete(el)) return;
      el.classList.remove("revelation-attente");
      animate(el, { opacity: [0, 1], transform: ["translateY(22px)", "translateY(0)"] }, { duration: 0.6, ease: EASE });
      const enfants = el.querySelectorAll(ENFANTS);
      if (enfants.length) {
        animate(enfants, { opacity: [0, 1], transform: ["translateY(12px)", "translateY(0)"] }, { duration: 0.45, ease: EASE, delay: stagger(0.045, { startDelay: 0.12 }) });
      }
    };
    // Filet de sécurité : un défilement très rapide peut sauter le seuil d'apparition.
    const verifier = () => enAttente.forEach((el) => el.getBoundingClientRect().top < window.innerHeight && reveler(el));
    window.addEventListener("scroll", verifier, { passive: true });

    const preparer = (el) => {
      if (vus.has(el)) return;
      vus.add(el);
      // Imbriquée dans une section déjà prise en charge : elle suit son parent.
      if (el.parentElement?.closest(SECTIONS) && vus.has(el.parentElement.closest(SECTIONS))) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
      el.classList.add("revelation-attente");
      enAttente.add(el);
      arrets.push(inView(el, () => reveler(el), { amount: 0.12 }));
    };

    const balayer = () => main.querySelectorAll(SECTIONS).forEach(preparer);
    const id = requestAnimationFrame(balayer);
    const obs = new MutationObserver(balayer);
    obs.observe(main, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(id);
      obs.disconnect();
      window.removeEventListener("scroll", verifier);
      arrets.forEach((f) => typeof f === "function" && f());
      main.querySelectorAll(".revelation-attente").forEach((el) => el.classList.remove("revelation-attente"));
    };
  }, []);
}
