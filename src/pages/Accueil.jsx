import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormulaireContact from "./Newsletter";

function IconDocument() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h6" strokeLinecap="round" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" />
      <path d="M2 20h20" strokeLinecap="round" />
    </svg>
  );
}
function IconSecteur() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconFleche() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconTableauBord() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M3 9h18M8 9v11" strokeLinecap="round" />
    </svg>
  );
}
function IconBarometre() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" />
      <path d="M12 12l4-3" strokeLinecap="round" />
    </svg>
  );
}
function IconDossier() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z" />
    </svg>
  );
}
function IconMethodologie() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
function IconPedagogie() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 4L2 9l10 5 10-5-10-5z" />
      <path d="M6 11.5V17c0 1.5 3 3 6 3s6-1.5 6-3v-5.5" />
    </svg>
  );
}

const CONTENUS = [
  { titre: "Tableau de bord mensuel", description: "Les chiffres importants du mois, en un coup d'œil.", Icone: IconTableauBord },
  { titre: "Baromètre économique", description: "Ce qui s'améliore, ce qui se dégrade.", Icone: IconBarometre },
  { titre: "Dossier spécial", description: "Analyses approfondies sur un sujet précis (ex : le cacao en Côte d'Ivoire).", Icone: IconDossier },
  { titre: "Observatoire sectoriel", description: "Agriculture, mines, énergie, télécoms, transport, industrie, banque.", Icone: IconSecteur },
  { titre: "Méthodologie", description: "Comment les indicateurs sont calculés.", Icone: IconMethodologie },
  { titre: "Comprendre l'économie", description: "Qu'est-ce que le PIB ? Pourquoi l'inflation augmente ?", Icone: IconPedagogie },
];

const PUBLICATIONS = [
  { categorie: "Note de conjoncture", titre: "Situation économique du Sénégal — Juillet 2026", date: "28 Juil. 2026", Icone: IconDocument, accent: "accent-gold" },
  { categorie: "Analyse thématique", titre: "Naïf vs SARIMA : quand le modèle simple gagne", date: "28 Juil. 2026", Icone: IconChart, accent: "accent-teal" },
  { categorie: "Focus secteur", titre: "Agriculture, industrie, services : qui tire la croissance ?", date: "29 Juil. 2026", Icone: IconSecteur, accent: "accent-gold" },
];

export default function Accueil() {
  const { t } = useTranslation();

  return (
    <div className="page-full">
      <section className="hero-full">
        <div className="hero-full-inner">
          <p className="hero-eyebrow">BCEAO · UEMOA · Observatoire économique</p>
          <h1 className="hero-title">{t("titre_hero")}</h1>
          <p className="hero-sub">
            Des données fiables et des prévisions rigoureuses pour suivre
            l'économie sénégalaise et ouest-africaine — inflation, taux de
            change, PIB, et plus encore.
          </p>
          <Link to="/donnees" className="cta-button">
            Explorer les données →
          </Link>
        </div>
      </section>

      <div className="page page--wide">
        <section className="contenus-section">
          <h2 className="section-title section-title--nu">Explorer nos contenus</h2>
          <div className="contenus-grid">
            {CONTENUS.map((c, i) => (
              <div key={i} className="contenu-card">
                <span className="contenu-icon">
                  <c.Icone />
                </span>
                <h3 className="contenu-titre">{c.titre}</h3>
                <p className="contenu-description">{c.description}</p>
              </div>
            ))}
          </div>
          <p className="contenus-note">
            Ces sections seront activées progressivement, une par une.
          </p>
        </section>

        <div className="home-columns">
          <section className="a-la-une">
            <p className="section-label">À la une</p>
            <h2 className="a-la-une-titre">
              Croissance modérée en 2026, perspectives prudentes pour 2027
            </h2>
            <p className="a-la-une-texte">
              L'économie sénégalaise montre une résilience face aux chocs
              externes, portée par l'agriculture et les services, avec une
              inflation en repli par rapport au pic de 2022-2023.
            </p>
            <Link to="/donnees" className="lire-analyse">
              Lire l'analyse →
            </Link>
          </section>

          <section className="publications-section">
            <h2 className="section-title">Dernières publications</h2>
            <div className="publications-row">
              <div className="publications-grid">
                {PUBLICATIONS.map((pub, i) => (
                  <article key={i} className="publication-card">
                    <span className={`publication-icon ${pub.accent}`}>
                      <pub.Icone />
                    </span>
                    <p className="publication-categorie">{pub.categorie}</p>
                    <h3 className="publication-titre">{pub.titre}</h3>
                    <p className="publication-date">{pub.date}</p>
                  </article>
                ))}
              </div>
              <button className="pagination-arrow" aria-label="Voir plus de publications">
                <IconFleche />
              </button>
            </div>
          </section>
        </div>

        <section className="newsletter-section">
          <h2 className="section-title">Restez informé</h2>
          <p>Abonnez-vous à notre lettre d'information pour recevoir les dernières analyses et publications.</p>
          <FormulaireContact />
        </section>

        <footer className="site-footer-strip">
          <p>
            L'Observatoire Économique de l'UEMOA est une plateforme de suivi et
            d'analyse des évolutions économiques dans l'espace UEMOA.
          </p>
        </footer>
      </div>
    </div>
  );
}