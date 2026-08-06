import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const ITEMS = [
  {
    type: "publication",
    categorie: "Note de conjoncture",
    titre: "Situation économique du Sénégal — Juillet 2026",
    date: "28 Juil. 2026",
  },
  {
    type: "publication",
    categorie: "Analyse thématique",
    titre: "Naïf vs SARIMA : quand le modèle simple gagne",
    date: "28 Juil. 2026",
  },
  {
    type: "publication",
    categorie: "Focus secteur",
    titre: "Agriculture, industrie, services : qui tire la croissance ?",
    date: "29 Juil. 2026",
  },
  {
    type: "actualite",
    categorie: "Politique économique",
    titre: "Réunion du Conseil des Ministres de l'UEMOA : principales décisions",
    date: "27 Juil. 2026",
  },
  {
    type: "actualite",
    categorie: "Finances",
    titre: "Le marché financier régional enregistre une hausse des émissions obligataires",
    date: "23 Juil. 2026",
  },
  {
    type: "actualite",
    categorie: "Économie mondiale",
    titre: "Perspectives économiques mondiales : le FMI révise ses prévisions",
    date: "19 Juil. 2026",
  },
  {
    type: "alerte",
    categorie: "Alerte inflation",
    titre: "L'inflation au Mali dépasse le seuil de vigilance de 3,5 %",
    date: "30 Juil. 2026",
  },
  {
    type: "alerte",
    categorie: "Alerte données",
    titre: "Les réserves de change ne sont plus mises à jour depuis 2015",
    date: "En continu",
  },
];

const ONGLETS = [
  { id: "toutes", label: "Toutes" },
  { id: "publication", label: "Publications" },
  { id: "actualite", label: "Actualités" },
  { id: "alerte", label: "Alertes" },
];

export default function VeillePublicationsAlertes() {
  const [ongletActif, setOngletActif] = useState("toutes");

  const itemsFiltres =
    ongletActif === "toutes" ? ITEMS : ITEMS.filter((i) => i.type === ongletActif);

  return (
    <section className="veille-section">
      <div className="veille-header">
        <h2 className="dynamic-section-title">Veille, publications et alertes</h2>
        <Link to="/donnees" className="veille-voir-tout">Voir tout →</Link>
      </div>

      <div className="veille-tabs">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            className={`veille-tab ${ongletActif === o.id ? "active" : ""}`}
            onClick={() => setOngletActif(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div key={ongletActif} className="veille-grid">
        {itemsFiltres.map((item, i) => (
          <article key={i} className={`veille-card veille-card--${item.type}`}>
            <p className="veille-card-categorie">{item.categorie}</p>
            <h3 className="veille-card-titre">{item.titre}</h3>
            <span className="veille-card-date">{item.date}</span>
          </article>
        ))}
      </div>
    </section>
  );
}