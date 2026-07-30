import { Link } from "react-router-dom";

export default function Accueil() {
  return (
    <div className="page">
      <section className="hero-home">
        <p className="hero-eyebrow">BCEAO · UEMOA · Observatoire économique</p>
        <h1 className="hero-title">
          Comprendre l'économie pour construire l'avenir.
        </h1>
        <p className="hero-sub">
          Des données fiables et des prévisions rigoureuses pour suivre
          l'économie sénégalaise et ouest-africaine — inflation, taux de
          change, PIB, et plus encore.
        </p>
        <Link to="/donnees" className="cta-button">
          Explorer les données →
        </Link>
      </section>
    </div>
  );
}