import CalendrierPublications from "./CalendrierPublications";

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
        <p>
          Un simulateur "et si" (impact du prix du pétrole sur l'inflation) a été
          testé avec un modèle SARIMAX, mais l'échantillon annuel disponible (moins
          de 30 années) est trop court pour établir un lien statistiquement fiable.
          Cette fonctionnalité n'est donc pas activée pour l'instant, plutôt que
          d'afficher un résultat non prouvé.
        </p>

        <h2>Fraîcheur des données</h2>
        <p>
          Les réserves de change ne sont plus mises à jour depuis 2015 dans
          la base BCEAO consultée — cette donnée est affichée avec sa date
          d'origine plutôt que masquée.
        </p>
      </section>

      <CalendrierPublications />
    </div>
  );
}