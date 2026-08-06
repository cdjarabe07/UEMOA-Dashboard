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
 
const CONTENUS_KEYS = [
  { key: "tableau_bord", Icone: IconTableauBord },
  { key: "barometre", Icone: IconBarometre },
  { key: "dossier", Icone: IconDossier },
  { key: "observatoire", Icone: IconSecteur },
  { key: "methodologie", Icone: IconMethodologie },
  { key: "comprendre", Icone: IconPedagogie },
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
    <h1 className="hero-title">{t("titre_hero")}</h1>
    <div className="hero-divider"></div>
    <p className="hero-sub">{t("sous_titre_hero")}</p>
    <Link to="/donnees" className="cta-button">
      {t("cta_explorer")}
    </Link>
  </div>
</section>
 
 <section className="features-strip">
  <div className="features-grid">
    <div>
      <div className="feature-icon-box" style={{background: "#e0e7ff"}}><IconTableauBord /></div>
      <h3 className="feature-titre">Données fiables</h3>
      <p className="feature-desc">Accédez à des données actualisées et harmonisées provenant de sources internationales reconnues.</p>
      <Link to="/donnees" className="feature-link">Explorer les données →</Link>
    </div>
    <div>
      <div className="feature-icon-box" style={{background: "#dcfce7"}}><IconBarometre /></div>
      <h3 className="feature-titre">Analyses approfondies</h3>
      <p className="feature-desc">Des analyses détaillées pour comprendre les tendances et leurs impacts.</p>
      <Link to="/donnees" className="feature-link">Consulter les analyses →</Link>
    </div>
    <div>
      <div className="feature-icon-box" style={{background: "#fef3c7"}}><IconChart /></div>
      <h3 className="feature-titre">Perspectives éclairées</h3>
      <p className="feature-desc">Des perspectives économiques et sectorielles pour anticiper les évolutions.</p>
      <Link to="/donnees" className="feature-link">Voir les perspectives →</Link>
    </div>
    <div>
      <div className="feature-icon-box" style={{background: "#f3e8ff"}}><IconPedagogie /></div>
      <h3 className="feature-titre">Outils interactifs</h3>
      <p className="feature-desc">Simulez des scénarios, comparez des pays et évaluez des risques en quelques clics.</p>
      <Link to="/donnees" className="feature-link">Découvrir les outils →</Link>
    </div>
  </div>
</section>

      <div className="page page--wide">
        <section className="contenus-section-light">
  <h2 className="section-title section-title--nu" style={{color: "#0f1b2d", borderTop: "none"}}>{t("titre_contenus")}</h2>
  <div className="contenus-grid-light">
    {CONTENUS_KEYS.map((c, i) => (
      <div key={i} className="contenu-card-light">
        <span className="contenu-icon">
          <c.Icone />
        </span>
        <h3 className="contenu-titre">{t(`${c.key}_titre`)}</h3>
        <p className="contenu-description">{t(`${c.key}_desc`)}</p>
      </div>
    ))}
  </div>
  <p className="contenus-note-light">{t("note_contenus")}</p>
</section>
 
        <section className="pubs-light-section">
  <div className="pubs-light-header">
    <h2 className="pubs-light-title">Dernières publications</h2>
    <Link to="/donnees" className="pubs-light-voir-tout">Voir toutes les publications →</Link>
  </div>
  <div className="pubs-light-grid">
    {PUBLICATIONS.map((pub, i) => (
      <article key={i} className="pub-light-card">
        <div className="pub-light-image"></div>
        <div className="pub-light-body">
          <p className="pub-light-categorie">{pub.categorie}</p>
          <h3 className="pub-light-titre">{pub.titre}</h3>
          <div className="pub-light-footer">
            <span className="pub-light-date">{pub.date}</span>
            <span className="pub-light-download">↓</span>
          </div>
        </div>
      </article>
    ))}
  </div>
</section>

<section className="plateforme-section">
  <h2 className="plateforme-titre">Une plateforme au service de vos décisions</h2>
  <p className="plateforme-sous-titre">Des ressources et des outils conçus pour répondre aux besoins des décideurs, chercheurs, investisseurs et citoyens.</p>
  <div className="plateforme-grid">
    <div className="plateforme-item">
      <div className="plateforme-item-icon"><IconSecteur /></div>
      <h3 className="plateforme-item-titre">Couverture mondiale</h3>
      <p className="plateforme-item-desc">Suivez les évolutions économiques et financières par pays, région et au niveau global.</p>
    </div>
    <div className="plateforme-item">
      <div className="plateforme-item-icon"><IconBarometre /></div>
      <h3 className="plateforme-item-titre">Indicateurs clés</h3>
      <p className="plateforme-item-desc">Des indicateurs macroéconomiques, financiers, sociaux et sectoriels mis à jour en continu.</p>
    </div>
    <div className="plateforme-item">
      <div className="plateforme-item-icon"><IconMethodologie /></div>
      <h3 className="plateforme-item-titre">Veille et alertes</h3>
      <p className="plateforme-item-desc">Soyez informé des événements économiques importants et des risques émergents.</p>
    </div>
    <div className="plateforme-item">
      <div className="plateforme-item-icon"><IconChart /></div>
      <h3 className="plateforme-item-titre">Simulations & scénarios</h3>
      <p className="plateforme-item-desc">Évaluez l'impact de différents chocs et scénarios sur les économies et les marchés.</p>
    </div>
    <div className="plateforme-item">
      <div className="plateforme-item-icon"><IconTableauBord /></div>
      <h3 className="plateforme-item-titre">Rapports & exports</h3>
      <p className="plateforme-item-desc">Téléchargez des rapports personnalisés et des données dans plusieurs formats.</p>
    </div>
  </div>
</section>
 
        <section style={{background: "#f7f7f5"}}>
  <div className="actu-newsletter-row">
  <div className="actu-col">
    <h2>Actualités économiques</h2>
    <div className="actu-item">
      <span className="actu-item-date">27 Juil. 2026</span>
      <p className="actu-item-titre">Réunion du Conseil des Ministres de l'UEMOA : principales décisions</p>
      <Link to="/donnees" className="actu-item-lien">Lire la suite →</Link>
    </div>
    <div className="actu-item">
      <span className="actu-item-date">23 Juil. 2026</span>
      <p className="actu-item-titre">Le marché financier régional enregistre une hausse des émissions obligataires</p>
      <Link to="/donnees" className="actu-item-lien">Lire la suite →</Link>
    </div>
    <div className="actu-item">
      <span className="actu-item-date">19 Juil. 2026</span>
      <p className="actu-item-titre">Perspectives économiques mondiales : le FMI révise ses prévisions</p>
      <Link to="/donnees" className="actu-item-lien">Lire la suite →</Link>
    </div>
  </div>
  <div className="newsletter-card">
    <h2>{t("titre_newsletter")}</h2>
    <p>{t("texte_newsletter")}</p>
    <FormulaireContact />
  </div>
  </div>
</section>
 
<section className="partenaires-strip">
  <p className="partenaires-titre">Nos partenaires</p>
  <div className="partenaires-logos">
    <span className="partenaire-logo">BCEAO</span>
    <span className="partenaire-logo">FMI</span>
    <span className="partenaire-logo">BANQUE MONDIALE</span>
    <span className="partenaire-logo">OCDE</span>
    <span className="partenaire-logo">Union européenne</span>
  </div>
</section>
</div>
        <footer className="site-footer-full">
  <div className="footer-columns">
    <div className="footer-brand-col">
      <h3>Observatoire Économique de l'UEMOA</h3>
      <p>Une plateforme de référence pour le suivi, l'analyse et l'anticipation des évolutions économiques dans les 8 pays membres.</p>
    </div>
    <div className="footer-col">
      <h4>Navigation</h4>
      <Link to="/">Accueil</Link>
      <Link to="/donnees">Données</Link>
      <Link to="/methodologie">Méthodologie</Link>
    </div>
    <div className="footer-col">
      <h4>Données</h4>
      <Link to="/donnees">Indicateurs clés</Link>
      <Link to="/donnees">Tableau de bord</Link>
      <Link to="/donnees">Séries temporelles</Link>
    </div>
    <div className="footer-col">
      <h4>Ressources</h4>
      <Link to="/methodologie">Méthodologie</Link>
      <Link to="/methodologie">Sources de données</Link>
    </div>
    <div className="footer-col">
      <h4>Mentions</h4>
      <Link to="/">Mentions légales</Link>
      <Link to="/">Confidentialité</Link>
    </div>
  </div>
  <div className="footer-bottom">
    © 2026 Observatoire Économique de l'UEMOA. Tous droits réservés.
  </div>
</footer> 
    </div>
  );
}