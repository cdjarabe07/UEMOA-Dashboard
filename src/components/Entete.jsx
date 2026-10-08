import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";

const LIENS = [
  { to: "/conjoncture", cle: "nav_conjoncture" },
  { to: "/analyses", cle: "nav_analyses" },
  { to: "/pays", cle: "nav_pays" },
  { to: "/donnees", cle: "nav_donnees" },
  { to: "/publications", cle: "nav_publications" },
  { to: "/methodologie", cle: "nav_methodologie" },
];

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
    </header>
  );
}
