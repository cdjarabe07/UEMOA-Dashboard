import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PAYS, UNION, INDICATEURS, getIndicateur, serie, valeur, anneesDisponibles, famillesDisponibles } from "../data/portail.js";
import { fmtCourt, fmtValeur, fmtPeriode, libelleUnite } from "../lib/format.js";
import { GraphiqueSeries, BarresPays, COULEUR_ZONE } from "../components/Graphiques.jsx";
import Bandeau from "../components/Bandeau.jsx";
import Visualisation from "../components/Visualisation.jsx";
import Onglets from "../components/Onglets.jsx";
import Exports from "../components/Exports.jsx";
import Introuvable from "./Introuvable.jsx";

/** /indicateurs : catalogue par thème. */
export function ListeIndicateurs() {
  const { t } = useTranslation();
  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { label: t("nav_indicateurs") }]}
        titre={t("ind_titre")}
        sousTitre={t("ind_chapeau", { n: INDICATEURS.length })}
        meta={[
          { label: t("meta_couverture"), valeur: t("acc_meta_couverture", { n: PAYS.length }) },
          { label: t("meta_source"), valeur: "BCEAO · DBnomics" },
        ]}
      />
      <section className="section">
        <div className="conteneur catalogue">
          {famillesDisponibles().map((f) => (
            <section key={f.id} className="catalogue-famille">
              <h2>{t(`famille_${f.id}`)}</h2>
              <ul>
                {f.indicateurs.map((i) => (
                  <li key={i.id}>
                    <Link to={`/indicateurs/${i.id}`}>
                      <b>{t(i.libelle)}</b>
                      <span>
                        {libelleUnite(i.unite)} · {i.parPays ? t("acc_meta_couverture", { n: PAYS.length }) : t("zone_uemoa")} ·{" "}
                        <span className="nombre">{fmtPeriode(i.periode)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}

/** /indicateurs/:id : un indicateur, huit pays. */
export default function FicheIndicateur() {
  const { id } = useParams();
  const { t } = useTranslation();
  const ind = getIndicateur(id);
  const [anneeChoisie, setAnneeChoisie] = useState(null);
  const [zones, setZones] = useState(null);
  if (!ind) return <Introuvable />;

  const nom = t(ind.libelle);
  const unite = libelleUnite(ind.unite);
  const annees = ind.parPays ? anneesDisponibles(ind.id) : [];
  const annee = annees.includes(anneeChoisie) ? anneeChoisie : annees[annees.length - 1];
  const nomZone = (z) => t(`zone_${z}`);

  // 1. Comparaison entre pays pour une année
  const donnees = PAYS.map((p) => ({ id: p.id, nom: nomZone(p.id), valeur: valeur(ind.id, p.id, annee) }));
  const vUnion = valeur(ind.id, UNION.id, annee);
  const classes = donnees.filter((d) => d.valeur != null).sort((a, b) => b.valeur - a.valeur);
  const comparableUnion = ind.unite !== "Mds FCFA";

  // 2. Évolution : pays sélectionnés (+ Union si comparable)
  const zonesDispo = ind.parPays ? PAYS.map((p) => p.id) : [];
  const actives = zones && zones.every((z) => zonesDispo.includes(z)) ? zones : zonesDispo;
  const basculer = (z) =>
    setZones((prec) => {
      const cour = prec && prec.every((x) => zonesDispo.includes(x)) ? prec : zonesDispo;
      if (!cour.includes(z)) return [...cour, z];
      return cour.length > 1 ? cour.filter((x) => x !== z) : cour;
    });
  const series = Object.fromEntries(actives.map((z) => [z, serie(ind.id, z)]));
  if (!ind.parPays || comparableUnion) series.uemoa = serie(ind.id, UNION.id);
  const noms = Object.fromEntries([...PAYS, UNION].map((z) => [z.id, nomZone(z.id)]));
  const fin = ind.periode[1];
  const dixAns = Array.from({ length: 10 }, (_, i) => fin - 9 + i);
  const zonesTableau = [...(ind.parPays ? PAYS : []), UNION];

  const colonnesExport = [{ cle: "zone", titre: t("col_pays") }, ...dixAns.map((a) => ({ cle: String(a), titre: String(a) }))];
  const lignesExport = zonesTableau.map((z) => ({ zone: nomZone(z.id), ...Object.fromEntries(dixAns.map((a) => [String(a), valeur(ind.id, z.id, a)])) }));
  const autres = INDICATEURS.filter((i) => i.famille === ind.famille && i.id !== ind.id);

  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { to: "/indicateurs", label: t("nav_indicateurs") }, { label: t(`famille_${ind.famille}`) }]}
        surtitre={t(`famille_${ind.famille}`)}
        titre={nom}
        sousTitre={t(`rg_${ind.id}_def`)}
        meta={[
          { label: t("meta_unite"), valeur: unite },
          { label: t("meta_periode"), valeur: fmtPeriode(ind.periode) },
          { label: t("meta_couverture"), valeur: ind.parPays ? t("acc_meta_couverture", { n: PAYS.length }) : t("zone_uemoa") },
          { label: t("meta_source"), valeur: "BCEAO · DBnomics" },
        ]}
      />

      <section className="section">
        <div className="conteneur">
          <Onglets
            label={nom}
            onglets={[
              ind.parPays && {
                id: "comparaison",
                libelle: t("onglet_comparaison"),
                contenu: (
                  <Visualisation
                    titre={t("fiche_comparaison_titre", { annee })}
                    sousTitre={unite}
                    outils={
                      <label className="selecteur">
                        <span>{t("col_annee")}</span>
                        <select value={annee} onChange={(e) => setAnneeChoisie(Number(e.target.value))}>
                          {[...annees].reverse().map((a) => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </label>
                    }
                    graphique={
                      <BarresPays donnees={donnees} unite={ind.unite} union={comparableUnion ? vUnion : null} libelleUnion={t("zone_uemoa")} />
                    }
                    notes={{
                      lecture: classes.length
                        ? t("fiche_lecture", {
                            pays: classes[0].nom,
                            valeur: fmtValeur(classes[0].valeur, ind.unite),
                            annee,
                            dernier: classes[classes.length - 1].nom,
                            valeurDernier: fmtValeur(classes[classes.length - 1].valeur, ind.unite),
                          })
                        : null,
                      source: t("source_bceao"),
                    }}
                  />
                ),
              },
              {
                id: "evolution",
                libelle: t("onglet_evolution"),
                contenu: (
                  <Visualisation
                    titre={t("fiche_evolution_titre")}
                    sousTitre={unite}
                    graphique={
                      <>
                        {ind.parPays && (
                          <div className="puces fiche-zones" role="group" aria-label={t("fiche_zones")}>
                            {PAYS.map((p) => (
                              <button key={p.id} type="button" className="puce puce-zone" aria-pressed={actives.includes(p.id)} onClick={() => basculer(p.id)}>
                                <i style={{ background: COULEUR_ZONE[p.id] }} /> {nomZone(p.id)}
                              </button>
                            ))}
                          </div>
                        )}
                        <GraphiqueSeries series={series} unite={ind.unite} noms={noms} hauteur={380} zero={comparableUnion} />
                        {series.uemoa && (
                          <p className="legende">
                            <span><i className="pointille pointille--encre" /> {t("zone_uemoa")}</span>
                          </p>
                        )}
                      </>
                    }
                    notes={{
                      champ: ind.parPays ? t("champ_uemoa", { n: PAYS.length }) : t("champ_umoa"),
                      source: t("source_bceao"),
                    }}
                  />
                ),
              },
              {
                id: "donnees",
                libelle: t("onglet_donnees"),
                contenu: (
                  <div className="visu">
                    <div className="visu-tete">
                      <div>
                        <h2>{t("fiche_donnees_titre", { debut: dixAns[0], fin })}</h2>
                        <p>{unite}</p>
                      </div>
                    </div>
                    <div className="defilant">
                      <table className="tableau">
                        <thead>
                          <tr>
                            <th scope="col">{t("col_pays")}</th>
                            {dixAns.map((a) => <th key={a} scope="col" className="num nombre">{a}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {zonesTableau.map((z) => (
                            <tr key={z.id} className={z.id === "uemoa" ? "ligne-union" : undefined}>
                              <th scope="row">{z.id === "uemoa" ? nomZone(z.id) : <Link to={`/pays/${z.id}`}>{nomZone(z.id)}</Link>}</th>
                              {dixAns.map((a) => <td key={a} className="num nombre">{fmtCourt(valeur(ind.id, z.id, a), ind.unite)}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Exports nom={`uemoa_${ind.id}`} titre={`${nom} (${unite})`} colonnes={colonnesExport} lignes={lignesExport} />
                  </div>
                ),
              },
            ].filter(Boolean)}
          />
        </div>
      </section>

      <section className="section">
        <div className="conteneur fiche-pied fiche-pied--fin">
          <div>
            <h2>{t("fiche_definition")}</h2>
            <p>{t(`rg_${ind.id}_def`)}</p>
            <p className="texte-secondaire">
              {t("meta_source")} : BCEAO, <code>{ind.serie_bceao}</code>.{" "}
              <Link to="/methodologie#preparation">{t("fiche_controles")}</Link>
            </p>
          </div>
          {autres.length > 0 && (
            <div>
              <h2>{t("fiche_autres", { famille: t(`famille_${ind.famille}`) })}</h2>
              <ul className="liste-liens">
                {autres.map((i) => (
                  <li key={i.id}><Link to={`/indicateurs/${i.id}`}>{t(i.libelle)}</Link></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
