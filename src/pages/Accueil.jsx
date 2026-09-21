import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import FormulaireContact from "./Newsletter";
import { Database, TrendingUp, PieChart, SlidersHorizontal, LayoutDashboard, Gauge, FolderOpen, Grid3x3, Search, GraduationCap, FileText, ChevronRight } from "lucide-react";
import CartePays from "./CartePays";
import PrevisionsSimulations from "./PrevisionsSimulations";
import VeillePublicationsAlertes from "./VeillePublicationsAlertes";
import previsionsData from "../data/previsions.json";
import metaData from "../data/meta.json";
import comparaisonData from "../data/comparaison_pays.json";
 
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
  { key: "tableau_bord", Icone: LayoutDashboard },
  { key: "barometre", Icone: Gauge },
  { key: "dossier", Icone: FolderOpen },
  { key: "observatoire", Icone: Grid3x3 },
  { key: "methodologie", Icone: Search },
  { key: "comprendre", Icone: GraduationCap },
];
 
// ---------- Données réelles pour l'Accueil -------------------------------
// (previsions.json, meta.json, comparaison_pays.json — source de vérité)
const NOMS_ACCUEIL = {
  pib: "PIB nominal",
  inflation: "Inflation",
  masse_monetaire: "Masse monétaire (M2)",
};

const fmtValeur = (v, unite) =>
  unite === "%"
    ? `${v.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`
    : `${v.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} ${unite}`;

const prevs2026 = (id) => previsionsData.find((p) => p.indicateur === id && p.annee === 2026);

const NB_PREV = previsionsData
  .map((p) => p.indicateur)
  .filter((v, i, a) => a.indexOf(v) === i).length;

const ANNEES_PREV = previsionsData.reduce(
  (acc, p) => [Math.min(acc[0], p.annee), Math.max(acc[1], p.annee)],
  [9999, 0]
);

const NB_PAYS = comparaisonData
  .map((r) => r.pays)
  .filter((v, i, a) => a.indexOf(v) === i).length;

const DERNIERE_ANNEE = comparaisonData
  .map((r) => parseInt(r.annee.slice(0, 4), 10))
  .reduce((m, a) => Math.max(m, a), 0);

const DATE_MAJ_ACCUEIL = (() => {
  if (!metaData || typeof metaData.generated_at !== "string") return null;
  const d = new Date(metaData.generated_at);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
})();
 
export default function Accueil() {
  const [featureActive, setFeatureActive] = useState("donnees");
  const { t } = useTranslation();

  // Cartes de chiffres clés, construites à partir des vraies prévisions.
  const cartesCles = [
    {
      categorie: t("accueil_cles_categorie"),
      titre: "PIB nominal",
      date: prevs2026("pib") ? fmtValeur(prevs2026("pib").valeur_prevue, "Mds FCFA") : t("comparer_nd"),
      Icone: IconChart,
      accent: "accent-gold",
    },
    {
      categorie: t("accueil_cles_categorie"),
      titre: "Inflation",
      date: prevs2026("inflation") ? fmtValeur(prevs2026("inflation").valeur_prevue, "%") : t("comparer_nd"),
      Icone: IconDocument,
      accent: "accent-teal",
    },
    {
      categorie: t("accueil_cles_categorie"),
      titre: "Masse monétaire (M2)",
      date: prevs2026("masse_monetaire") ? fmtValeur(prevs2026("masse_monetaire").valeur_prevue, "Mds FCFA") : t("comparer_nd"),
      Icone: IconSecteur,
      accent: "accent-gold",
    },
  ];
 
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
    <div className={`feature-card ${featureActive === "donnees" ? "active" : ""}`} onClick={() => setFeatureActive("donnees")}>
      <div className="feature-icon-box" style={{background: "#e0e7ff", color: "#4338ca"}}><Database /></div>
      <h3 className="feature-titre">Données fiables</h3>
      <p className="feature-desc">Accédez à des données actualisées et harmonisées provenant de sources internationales reconnues.</p>
      <Link to="/donnees" className="feature-link">Explorer les données →</Link>
    </div>
    <div className={`feature-card ${featureActive === "analyses" ? "active" : ""}`} onClick={() => setFeatureActive("analyses")}>
      <div className="feature-icon-box" style={{background: "#dcfce7", color: "#15803d"}}><TrendingUp /></div>
      <h3 className="feature-titre">Analyses approfondies</h3>
      <p className="feature-desc">Des analyses détaillées pour comprendre les tendances et leurs impacts.</p>
      <Link to="/donnees" className="feature-link">Consulter les analyses →</Link>
    </div>
    <div className={`feature-card ${featureActive === "perspectives" ? "active" : ""}`} onClick={() => setFeatureActive("perspectives")}>
      <div className="feature-icon-box" style={{background: "#fef3c7", color: "#b45309"}}><PieChart /></div>
      <h3 className="feature-titre">Perspectives éclairées</h3>
      <p className="feature-desc">Des perspectives économiques et sectorielles pour anticiper les évolutions.</p>
      <Link to="/donnees" className="feature-link">Voir les perspectives →</Link>
    </div>
    <div className={`feature-card ${featureActive === "outils" ? "active" : ""}`} onClick={() => setFeatureActive("outils")}>
      <div className="feature-icon-box" style={{background: "#f3e8ff", color: "#7e22ce"}}><SlidersHorizontal /></div>
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
 
        <section className="dynamic-content-section">
  <div key={featureActive} className="dynamic-content-inner">
    {featureActive === "donnees" && (
      <>
        <h2 className="dynamic-section-title">{t("accueil_cles_titre")}</h2>
        <div className="pubs-light-grid">
          {cartesCles.map((pub, i) => (
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
      </>
    )}

    {featureActive === "analyses" && (
      <>
        <h2 className="dynamic-section-title">{t("accueil_analyses_titre")}</h2>
        <div className="analyses-list">
          <div className="analyse-item">
            <span>{t("accueil_analyses_previsions", { nb: NB_PREV })}</span>
            <Link to="/donnees" className="feature-link">{t("accueil_analyses_lire")}</Link>
          </div>
          <div className="analyse-item">
            <span>{t("accueil_analyses_comparaison", { pays: NB_PAYS })}</span>
            <Link to="/donnees" className="feature-link">{t("accueil_analyses_lire")}</Link>
          </div>
          <div className="analyse-item">
            <span>{t("accueil_analyses_alertes")}</span>
            <Link to="/methodologie" className="feature-link">{t("accueil_analyses_lire")}</Link>
          </div>
        </div>
      </>
    )}

    {featureActive === "perspectives" && (
      <>
        <h2 className="dynamic-section-title">{t("accueil_perspectives_titre")}</h2>
        <div className="previsions-list">
          <div className="prevision-item">
            <span>PIB 2026</span>
            <strong>{prevs2026("pib") ? fmtValeur(prevs2026("pib").valeur_prevue, "Mds FCFA") : t("comparer_nd")}</strong>
          </div>
          <div className="prevision-item">
            <span>Inflation 2026</span>
            <strong>{prevs2026("inflation") ? fmtValeur(prevs2026("inflation").valeur_prevue, "%") : t("comparer_nd")}</strong>
          </div>
        </div>
      </>
    )}

    {featureActive === "outils" && (
      <div className="simulateur-card">
        <h2 className="dynamic-section-title">Simulateur "Et si ?"</h2>
        <p>Explorez l'impact de chocs externes (prix du pétrole, taux) sur les indicateurs macroéconomiques. Fonctionnalité en cours de fiabilisation — voir la méthodologie pour les détails.</p>
        <Link to="/methodologie" className="cta-button">En savoir plus →</Link>
      </div>
    )}
  </div>
</section>

<CartePays />

<PrevisionsSimulations />

<VeillePublicationsAlertes />

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
    <h2>{t("accueil_resultats_titre")}</h2>
    <div className="actu-item">
      <span className="actu-item-date">{t("accueil_resultats_maj")}</span>
      <p className="actu-item-titre">{DATE_MAJ_ACCUEIL ? `${DATE_MAJ_ACCUEIL} UTC` : t("comparer_nd")}</p>
    </div>
    <div className="actu-item">
      <span className="actu-item-date">{t("accueil_resultats_previsions")}</span>
      <p className="actu-item-titre">{t("accueil_resultats_previsions_texte", { nb: NB_PREV, a: ANNEES_PREV[0], b: ANNEES_PREV[1] })}</p>
    </div>
    <div className="actu-item">
      <span className="actu-item-date">{t("accueil_resultats_comparaison")}</span>
      <p className="actu-item-titre">{t("accueil_resultats_comparaison_texte", { pays: NB_PAYS, annee: DERNIERE_ANNEE })}</p>
    </div>
    <div className="actu-item">
      <span className="actu-item-date">{t("accueil_resultats_sources")}</span>
      <p className="actu-item-titre">BCEAO · DBnomics</p>
    </div>
    <Link to="/methodologie" className="actu-item-lien">{t("accueil_resultats_lien")}</Link>
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