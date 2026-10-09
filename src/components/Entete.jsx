import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { Menu, Search, X } from "lucide-react";
import { PAYS, FAMILLES, INDICATEURS } from "../data/portail.js";
import { DOSSIERS } from "../contenu/index.js";
import { PHOTOS } from "../contenu/photos.js";
import { OUVRIR_RECHERCHE } from "./Recherche.jsx";
import { DATE_GENERATION } from "../lib/meta.js";
import { PROJECTIONS } from "../data/fmi.js";
import { fmtDate } from "../lib/format.js";

const LIENS = [
  { to: "/conjoncture", cle: "nav_conjoncture" },
  { to: "/analyses", cle: "nav_analyses" },
  { to: "/pays", cle: "nav_pays" },
  { to: "/donnees", cle: "nav_donnees" },
  { to: "/publications", cle: "nav_publications" },
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

/** Lien d'un panneau du méga-menu : titre et courte description. */
function LienPanneau({ to, titre, texte }) {
  return (
    <NavigationMenu.Link asChild>
      <Link to={to} className="mega-lien">
        <b>{titre}</b>
        {texte && <span>{texte}</span>}
      </Link>
    </NavigationMenu.Link>
  );
}

function Rubrique({ cle, to, actif, children }) {
  const { t } = useTranslation();
  return (
    <NavigationMenu.Item value={to}>
      {/* Le déclencheur est un vrai lien : un clic ouvre la page de la rubrique,
          le survol ouvre le panneau. */}
      <NavigationMenu.Trigger asChild>
        <Link to={to} className={`entete-lien mega-declencheur${actif ? " active" : ""}`}>
          {t(cle)} <span className="mega-chevron" aria-hidden="true">▾</span>
        </Link>
      </NavigationMenu.Trigger>
      <NavigationMenu.Content className="mega-contenu">{children}</NavigationMenu.Content>
    </NavigationMenu.Item>
  );
}

function MegaMenu() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const actif = (to) => pathname === to || pathname.startsWith(`${to}/`);
  const capitale = (zone) => PHOTOS.find((p) => p.zone === zone)?.ville;
  // Panneau piloté : il se referme à chaque changement de page.
  const [ouvert, setOuvert] = useState("");
  useEffect(() => setOuvert(""), [pathname]);

  return (
    <NavigationMenu.Root className="entete-mega" aria-label={t("nav_label")} delayDuration={120} value={ouvert} onValueChange={setOuvert}>
      <NavigationMenu.List className="mega-liste">
        <Rubrique cle="nav_conjoncture" to="/conjoncture" actif={actif("/conjoncture")}>
          <div className="mega-colonnes">
            <div>
              <p className="mega-titre">{t("nav_conjoncture")}</p>
              <LienPanneau to="/conjoncture" titre={t("mega_vue_ensemble")} texte={t("mega_conjoncture_desc")} />
              <LienPanneau to="/conjoncture/convergence" titre={t("nav_convergence")} texte={t("mega_convergence_desc")} />
              <LienPanneau to="/conjoncture/previsions" titre={t("nav_previsions")} texte={t("mega_previsions_desc")} />
              <LienPanneau to="/conjoncture#inflation-mensuelle" titre={t("im_section_titre")} texte={t("mega_im_desc")} />
            </div>
            <div>
              <p className="mega-titre">{t("conj_international_surtitre")}</p>
              <LienPanneau to="/conjoncture#international" titre={t("conj_international_titre")} texte={t("mega_matieres_desc")} />
              <LienPanneau to="/conjoncture#projections" titre={t("conj_projections_titre")} texte={t("mega_projections_desc", { fin: PROJECTIONS.derniere_annee })} />
            </div>
          </div>
        </Rubrique>

        <Rubrique cle="nav_analyses" to="/analyses" actif={actif("/analyses")}>
          <div className="mega-colonnes">
            <div>
              <p className="mega-titre">{t("nav_analyses")}</p>
              <LienPanneau to="/analyses" titre={t("analyses_liste_titre")} texte={t("mega_analyses_desc")} />
            </div>
            <div>
              <p className="mega-titre">{t("dossiers_titre")}</p>
              <div className="mega-grille">
                {DOSSIERS.map((d) => (
                  <LienPanneau key={d.id} to={`/analyses/dossiers/${d.id}`} titre={t(`dossier_${d.id}`)} />
                ))}
              </div>
            </div>
          </div>
        </Rubrique>

        <Rubrique cle="nav_pays" to="/pays" actif={actif("/pays")}>
          <div className="mega-colonnes">
            <div>
              <p className="mega-titre">{t("nav_pays")}</p>
              <LienPanneau to="/pays" titre={t("mega_tous_pays")} texte={t("mega_pays_desc")} />
            </div>
            <div>
              <p className="mega-titre">{t("mega_profils")}</p>
              <div className="mega-grille">
                {PAYS.map((p) => (
                  <LienPanneau key={p.id} to={`/pays/${p.id}`} titre={t(`zone_${p.id}`)} texte={capitale(p.id)} />
                ))}
              </div>
            </div>
          </div>
        </Rubrique>

        <Rubrique cle="nav_donnees" to="/donnees" actif={actif("/donnees")}>
          <div className="mega-colonnes">
            <div>
              <p className="mega-titre">{t("nav_donnees")}</p>
              <LienPanneau to="/donnees" titre={t("explo_titre")} texte={t("mega_donnees_desc", { n: INDICATEURS.length })} />
            </div>
            <div>
              <p className="mega-titre">{t("explo_theme")}</p>
              <div className="mega-grille">
                {FAMILLES.filter((f) => INDICATEURS.some((i) => i.famille === f)).map((f) => (
                  <LienPanneau
                    key={f}
                    to={`/donnees?theme=${f}`}
                    titre={t(`famille_${f}`)}
                    texte={t("dossier_series", { count: INDICATEURS.filter((i) => i.famille === f).length })}
                  />
                ))}
              </div>
            </div>
          </div>
        </Rubrique>

        <NavigationMenu.Item>
          <NavigationMenu.Link asChild active={actif("/publications")}>
            <NavLink to="/publications" className="entete-lien">{t("nav_publications")}</NavLink>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link asChild active={actif("/methodologie")}>
            <NavLink to="/methodologie" className="entete-lien">{t("nav_methodologie")}</NavLink>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <div className="mega-ancrage">
        <NavigationMenu.Viewport className="mega-fenetre" />
      </div>
    </NavigationMenu.Root>
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
      {/* Barre utilitaire : date des données, accès directs, langue. */}
      <div className="entete-utile">
        <div className="conteneur entete-utile-barre">
          <p className="entete-utile-union">
            {t("util_union")}
            {DATE_GENERATION && <span className="entete-utile-maj"> · {t("util_maj", { date: fmtDate(DATE_GENERATION) })}</span>}
          </p>
          <div className="entete-utile-liens">
            <Link to="/agenda">{t("agenda_titre")}</Link>
            <Link to="/methodologie#sources">{t("util_sources")}</Link>
            <Link to="/donnees">{t("util_telecharger")}</Link>
            <div className="langue" role="group" aria-label={t("langue")}>
              {["fr", "en"].map((l) => (
                <button key={l} type="button" aria-pressed={langue === l} onClick={() => i18n.changeLanguage(l)}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="conteneur entete-barre">
        <Link to="/" className="marque" aria-label={t("marque")}>
          <Logo />
          <span className="marque-texte">
            <b>{t("marque_l1")}</b>
            <span>{t("marque_l2")}</span>
          </span>
        </Link>

        <MegaMenu />

        {/* Petits écrans : menu en panneau. */}
        <nav className={`entete-nav ${ouvert ? "ouvert" : ""}`} aria-label={t("nav_label")}>
          {LIENS.map((l) => (
            <NavLink key={l.to} to={l.to} className="entete-lien">
              {t(l.cle)}
            </NavLink>
          ))}
        </nav>

        <div className="entete-outils">
          <button type="button" className="entete-recherche" onClick={() => window.dispatchEvent(new Event(OUVRIR_RECHERCHE))} aria-label={t("rech_titre")}>
            <Search size={16} aria-hidden="true" />
            <span className="entete-recherche-texte">{t("rech_bouton")}</span>
          </button>
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
      <div className="motif motif--filet" />
    </header>
  );
}
