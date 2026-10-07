import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Globe, ChartLine, Scale, TrendingUp } from "lucide-react";
import { BarresPays } from "../components/Graphiques.jsx";
import CartesPays from "../components/CartesPays.jsx";
import { PAYS, UNION, INDICATEURS, getIndicateur, valeur, derniereAnnee } from "../data/portail.js";
import { getIndicateur as indicateurPrevision, previsionPour } from "../data/catalogue.js";
import { evaluerConvergence } from "../lib/convergence.js";
import { fmtValeur, fmtCourt, fmtVariation, libelleUnite } from "../lib/format.js";

// Quatre chiffres de l'Union, et pas davantage : le détail vit dans les pages.
const CHIFFRES = ["croissance_reelle", "inflation", "dette_pib", "solde_budgetaire_pib"];

const ACCES = [
  { to: "/pays", Icone: Globe, cle: "pays" },
  { to: "/indicateurs", Icone: ChartLine, cle: "indicateurs" },
  { to: "/convergence", Icone: Scale, cle: "convergence" },
  { to: "/previsions", Icone: TrendingUp, cle: "previsions" },
];

export default function Accueil() {
  const { t } = useTranslation();
  const an = derniereAnnee("croissance_reelle");
  const croissanceUnion = valeur("croissance_reelle", UNION.id, an);
  const donneesUne = PAYS.map((p) => ({ id: p.id, nom: t(`zone_${p.id}`), valeur: valeur("croissance_reelle", p.id, an) }));
  const tri = donneesUne.filter((d) => d.valeur != null).sort((a, b) => b.valeur - a.valeur);
  const auDessus = tri.filter((d) => d.valeur > croissanceUnion).length;

  // En bref : convergence (critères dette et inflation) et prévision du Sénégal.
  const anConv = derniereAnnee("dette_pib");
  const conv = evaluerConvergence(anConv).filter((l) => l.zone.id !== "uemoa");
  const respecteCritere = (id) => conv.filter((l) => l.resultats.find((r) => r.critere.id === id)?.respecte).length;
  const nbDette = respecteCritere("dette");
  const nbInflation = respecteCritere("inflation");
  const pib = indicateurPrevision("pib");
  const p27 = previsionPour(pib, 2027);

  return (
    <>
      {/* 1. Grand visuel */}
      <section className="heros">
        <div className="conteneur heros-contenu">
          <p className="heros-surtitre">{t("acc_surtitre")}</p>
          <h1>{t("acc_titre")}</h1>
          <p className="heros-phrase">{t("mission")}</p>
          <div className="heros-actions">
            <Link to="/pays" className="bouton bouton--plein">
              {t("acc_cta_pays")} <ArrowRight size={16} />
            </Link>
            <Link to="/indicateurs" className="bouton bouton--clair">
              {t("acc_cta_indicateurs")}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. L'Union en chiffres */}
      <section className="chiffres-union" aria-label={t("acc_union", { annee: an })}>
        <div className="conteneur">
          <div className="chiffres-union-cadre">
            <p className="chiffres-union-titre">
              {t("acc_union", { annee: an })}
              <Link to="/indicateurs">{t("acc_union_lien")}</Link>
            </p>
            <dl>
              {CHIFFRES.map((id) => {
                const ind = getIndicateur(id);
                const v = valeur(id, UNION.id, an);
                const vp = valeur(id, UNION.id, an - 1);
                return (
                  <div key={id}>
                    <dt>{t(ind.court)}</dt>
                    <dd className="nombre">{fmtCourt(v, ind.unite)}</dd>
                    <span className="nombre">
                      {ind.unite === "% du PIB" ? `${t("unite_pct_pib")} · ` : ""}
                      {v != null && vp != null && `${fmtVariation(v - vp, "pt")} ${t("acc_vs", { annee: an - 1 })}`}
                    </span>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </section>

      {/* 3. Explorer */}
      <section className="section">
        <div className="conteneur">
          <div className="section-tete">
            <div>
              <p className="surtitre">{t("acc_explorer_surtitre")}</p>
              <h2>{t("acc_explorer_titre")}</h2>
            </div>
          </div>
          <div className="acces-grille">
            {ACCES.map(({ to, Icone, cle }) => (
              <Link key={cle} to={to} className="acces-bloc">
                <span className="acces-icone" aria-hidden="true">
                  <Icone size={22} />
                </span>
                <span className="acces-nom">{t(`nav_${cle}`)}</span>
                <span className="acces-texte">{t(`acc_acces_${cle}`, { n: PAYS.length })}</span>
                <span className="acces-fleche" aria-hidden="true">
                  <ArrowRight size={18} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Les pays de l'Union */}
      <section className="section section--claire">
        <div className="conteneur">
          <div className="section-tete">
            <div>
              <p className="surtitre">{t("acc_pays_surtitre")}</p>
              <h2>{t("acc_pays_titre")}</h2>
              <p>{t("acc_pays_chapeau")}</p>
            </div>
            <Link to="/pays" className="lien-fleche">{t("acc_pays_lien")}</Link>
          </div>
          <CartesPays />
        </div>
      </section>

      {/* 5. Un point à la une */}
      <section className="section">
        <div className="conteneur une">
          <div className="une-texte">
            <p className="surtitre">{t("acc_une")}</p>
            <h2>{t("acc_une_titre_court", { valeur: fmtValeur(croissanceUnion, "%"), annee: an })}</h2>
            <p>{t("acc_une_texte", { n: auDessus, total: PAYS.length, pays: tri[0]?.nom, valeur: fmtValeur(tri[0]?.valeur, "%") })}</p>
            <Link to="/indicateurs/croissance_reelle" className="lien-fleche">{t("acc_une_lien")}</Link>
          </div>
          <figure className="une-graphique">
            <BarresPays
              donnees={donneesUne}
              unite="%"
              union={croissanceUnion}
              libelleUnion={t("zone_uemoa")}
            />
            <figcaption className="note">{t("source_bceao")}</figcaption>
          </figure>
        </div>
      </section>

      {/* 6. En bref : convergence et prévisions */}
      <section className="section section--claire">
        <div className="conteneur">
          <div className="section-tete">
            <div>
              <p className="surtitre">{t("acc_bref_surtitre")}</p>
              <h2>{t("acc_bref_titre")}</h2>
            </div>
          </div>
          <div className="renvois">
            <Link to="/convergence" className="renvoi">
              <p className="surtitre">{t("nav_convergence")} · {anConv}</p>
              <p className="renvoi-chiffre nombre">{nbDette}/{PAYS.length}</p>
              <p className="renvoi-texte">{t("acc_bref_conv", { inflation: nbInflation, n: PAYS.length })}</p>
              <span className="lien-fleche">{t("acc_bref_conv_lien")}</span>
            </Link>
            <Link to="/previsions" className="renvoi">
              <p className="surtitre">{t("nav_previsions")} · {t("zone_senegal")}</p>
              <p className="renvoi-chiffre nombre">{fmtCourt(p27?.valeur_prevue, pib.unite)}</p>
              <p className="renvoi-texte">{t("acc_bref_prev", { annee: p27?.annee, unite: libelleUnite(pib.unite) })}</p>
              <span className="lien-fleche">{t("acc_bref_prev_lien")}</span>
            </Link>
            <Link to="/methodologie" className="renvoi">
              <p className="surtitre">{t("nav_methodologie")}</p>
              <p className="renvoi-chiffre nombre">{INDICATEURS.length}</p>
              <p className="renvoi-texte">{t("acc_bref_meth")}</p>
              <span className="lien-fleche">{t("acc_bref_meth_lien")}</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
