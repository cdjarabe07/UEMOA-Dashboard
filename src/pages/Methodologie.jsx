export default function Methodologie() {
  return (
    <div className="page">
      <header className="hero">
        <p className="hero-eyebrow">Méthodologie</p>
        <h1 className="hero-title">Comment sont calculées les prévisions.</h1>
      </header>

      <section>
        <h2>Source des données</h2>
        <p>
          Toutes les séries proviennent de la BCEAO (Banque Centrale des États
          de l'Afrique de l'Ouest), via la plateforme DBnomics, qui agrège les
          données officielles des banques centrales et instituts statistiques.
        </p>

        <h2>Modèle de prévision</h2>
        <p>
          Pour chaque indicateur, un modèle SARIMA (Seasonal AutoRegressive
          Integrated Moving Average) est entraîné, avec recherche automatique
          du meilleur ordre (p, d, q) par comparaison d'erreur moyenne (MAE)
          sur validation glissante (walk-forward).
        </p>

        <h2>Limites</h2>
        <p>
          Certains indicateurs (taux de change XOF/USD, balance commerciale)
          suivent une marche aléatoire : aucun modèle statistique ne fait
          mieux qu'une simple projection de la dernière valeur connue. Dans
          ces cas, le modèle naïf est utilisé et affiché comme tel, sans
          maquiller cette limite.
        </p>

        <h2>Fraîcheur des données</h2>
        <p>
          Les réserves de change ne sont plus mises à jour depuis 2015 dans
          la base BCEAO consultée — cette donnée est affichée avec sa date
          d'origine plutôt que masquée.
        </p>
      </section>
    </div>
  );
}