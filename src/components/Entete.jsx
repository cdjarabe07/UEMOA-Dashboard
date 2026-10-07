import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";

const LIENS = [
  { to: "/pays", cle: "nav_pays" },
  { to: "/indicateurs", cle: "nav_indicateurs" },
  { to: "/convergence", cle: "nav_convergence" },
  { to: "/previsions", cle: "nav_previsions" },
  { to: "/methodologie", cle: "nav_methodologie" },
];

export function Logo() {
  return (
    <svg className="logo-motif" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#263a7a" />
      <path d="M4 26L11 10l7 16z" fill="#d39b2a" />
      <path d="M14 26l7-16 7 16z" fill="#b8502a" />
      <circle cx="16" cy="7" r="2.2" fill="#f4ede2" />
    </svg>
  );
}

export default function Entete() {
  const { t, i18n } = useTranslation();
  const langue = i18n.language?.startsWith("en") ? "en" : "fr";
  const [ouvert, setOuvert] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOuvert(false), [pathname]);
  useEffect(() => {
    document.documentElement.lang = langue;
  }, [langue]);

  return (
    <header className="entete">
      <div className="conteneur entete-barre">
        <Link to="/" className="marque" aria-label={t("marque")}>
          <Logo />
          <span className="marque-texte">
            <b>{t("marque_l1")}</b>
            <span>{t("marque_l2")}</span>
          </span>
        </Link>

        <nav className={`entete-nav ${ouvert ? "ouvert" : ""}`} aria-label={t("nav_label")}>
          {LIENS.map((l) => (
            <NavLink key={l.to} to={l.to} className="entete-lien">
              {t(l.cle)}
            </NavLink>
          ))}
        </nav>

        <div className="entete-outils">
          <div className="langue" role="group" aria-label={t("langue")}>
            {["fr", "en"].map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={langue === l}
                onClick={() => i18n.changeLanguage(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="entete-burger"
            aria-expanded={ouvert}
            aria-label={t("menu")}
            onClick={() => setOuvert(!ouvert)}
          >
            {ouvert ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <div className="motif motif--fin" />
    </header>
  );
}
