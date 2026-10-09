import { Fragment, useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Download, Search, SlidersHorizontal, X } from "lucide-react";
import {
  PAYS,
  UNION,
  ZONES,
  FAMILLES,
  INDICATEURS,
  getIndicateur,
  serie,
  valeur,
  zonesDe,
  codeSerie,
  RATIOS_CONTROLES,
  SEUIL_ECART_MEDIAN,
  ZEROS_ECARTES,
  ruptureDe,
  anneeRupture,
  comparables,
} from "../data/portail.js";
import { CRITERES, respecte } from "../lib/convergence.js";
import { DATE_GENERATION } from "../lib/meta.js";
import { fmtCourt, fmtValeur, fmtVariation, fmtPeriode, fmtDate, libelleUnite } from "../lib/format.js";
import { exporterCSV, exporterJSON } from "../lib/export.js";
import { useMouvementReduit } from "../lib/mouvement.js";
import { GraphiqueSeries, BarresPays } from "../components/Graphiques.jsx";
import Bandeau from "../components/Bandeau.jsx";
import Apercu from "../components/Apercu.jsx";
import Introuvable from "./Introuvable.jsx";
import Fondu from "../components/Fondu.jsx";

const estPourcentage = (unite) => unite === "%" || unite === "% du PIB" || unite === "points de %";
// Les niveaux en milliards de FCFA ne se comparent pas à l'agrégat de l'Union.
const comparableUnion = (ind) => ind.unite !== "Mds FCFA";

// Recherche insensible à la casse et aux accents.
const normaliser = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Toutes les zones d'un indicateur, une colonne par zone (exports).
function tableauComplet(ind, t) {
  const zones = zonesDe(ind.id);
  const annees = [...new Set(zones.flatMap((z) => serie(ind.id, z.id).map((p) => p.annee)))].sort((a, b) => a - b);
  const colonnes = [{ cle: "annee", titre: t("col_annee") }, ...zones.map((z) => ({ cle: z.id, titre: t(`zone_${z.id}`) }))];
  const lignes = annees.map((a) => ({ annee: a, ...Object.fromEntries(zones.map((z) => [z.id, valeur(ind.id, z.id, a)])) }));
  return { colonnes, lignes };
}

/** Message bref après une action (téléchargement), annoncé aux lecteurs d'écran. */
function useRetour() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return undefined;
    const minuterie = setTimeout(() => setMessage(""), 3500);
    return () => clearTimeout(minuterie);
  }, [message]);
  return [message, setMessage];
}

/**
 * Note de rupture : sépare ce que les publications BCEAO établissent
 * explicitement de ce que l'Observatoire en déduit par recoupement.
 */
export function NoteRupture({ rupture, zone, ind }) {
  const { t } = useTranslation();
  const an = rupture.premiere_annee;
  const nomZone = t(`zone_${zone}`);
  const totale = rupture.etabli.find((e) => e.grandeur === "dette_publique_totale");
  const exterieure = rupture.etabli.find((e) => e.grandeur === "dette_publique_exterieure");
  const extZone = exterieure?.pct_pib?.[zone];
  const avant = valeur(ind.id, zone, an - 1);
  const apres = valeur(ind.id, zone, an);
  return (
    <section className="note-rupture" aria-labelledby="note-rupture-titre">
      <h3 id="note-rupture-titre">{t("rupture_titre", { annee: an })}</h3>
      <p>{t("rupture_resume", { annee: an })}</p>
      <h4>{t("rupture_etabli_titre")}</h4>
      <ul>
        {totale && (
          <li>
            {t("rupture_etabli_total", {
              annee: totale.annee,
              zone: t(`zone_${totale.zone}`),
              montant: fmtValeur(totale.montant_mds_fcfa, "Mds FCFA", 1),
              pct: fmtValeur(totale.pct_pib, "% du PIB"),
            })}{" "}
            <a href={totale.url} target="_blank" rel="noreferrer">{totale.source}</a>, {totale.reference}.
          </li>
        )}
        {exterieure && extZone != null && (
          <li>
            {t("rupture_etabli_ext", { annee: exterieure.annee, zone: nomZone, pct: fmtValeur(extZone, "% du PIB") })}{" "}
            <a href={exterieure.url} target="_blank" rel="noreferrer">{exterieure.source}</a>, {exterieure.reference}.
          </li>
        )}
      </ul>
      <h4>{t("rupture_deduit_titre")}</h4>
      <p>
        {avant != null && apres != null &&
          t("rupture_zone", { zone: nomZone, avant: an - 1, apres: an, vAvant: fmtValeur(avant, ind.unite), vApres: fmtValeur(apres, ind.unite) })}{" "}
        {t("rupture_deduit", { avant: an - 1, annee: an })}
      </p>
      <p className="note-rupture-consequence">{t("rupture_consequence", { annee: an })}</p>
      <Link to="/methodologie#ruptures" className="lien-fleche">
        {t("rupture_lien_methodo")} <span className="fleche">→</span>
      </Link>
    </section>
  );
}

// ---------------------------------------------------------------------------
// /donnees : explorateur
// ---------------------------------------------------------------------------

export function Explorateur() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [listeAnimee] = useAutoAnimate({ duration: 260 });
  const [retour, setRetour] = useRetour();

  const q = params.get("q") || "";
  const themes = (params.get("theme") || "").split(",").filter((f) => FAMILLES.includes(f));
  const pays = ZONES.some((z) => z.id === params.get("pays")) ? params.get("pays") : null;

  // Saisie locale, répercutée dans l'URL après une courte pause.
  const [saisie, setSaisie] = useState(q);
  useEffect(() => setSaisie(q), [q]);
  useEffect(() => {
    if (saisie === q) return undefined;
    const minuterie = setTimeout(() => maj({ q: saisie.trim() || null }), 200);
    return () => clearTimeout(minuterie);
  }, [saisie]); // eslint-disable-line react-hooks/exhaustive-deps

  function maj(changements) {
    const p = new URLSearchParams(params);
    for (const [cle, val] of Object.entries(changements)) {
      if (val) p.set(cle, val);
      else p.delete(cle);
    }
    setParams(p, { replace: true });
  }
  const basculerTheme = (f) =>
    maj({ theme: (themes.includes(f) ? themes.filter((x) => x !== f) : [...themes, f]).join(",") || null });
  const effacer = () => {
    setSaisie("");
    setParams(new URLSearchParams(), { replace: true });
  };

  const texte = (ind) =>
    normaliser(
      [t(ind.libelle), t(ind.court), t(`rg_${ind.id}_def`), t(`famille_${ind.famille}`), ind.id, ind.serie_bceao, ind.libelle_source].join(" ")
    );
  const correspond = (ind) => !q || normaliser(q).split(/\s+/).every((mot) => texte(ind).includes(mot));
  const couvre = (ind, z) => !z || zonesDe(ind.id).some((x) => x.id === z);
  const dansTheme = (ind) => !themes.length || themes.includes(ind.famille);

  const resultats = INDICATEURS.filter((i) => correspond(i) && couvre(i, pays) && dansTheme(i)).sort(
    (a, b) => FAMILLES.indexOf(a.famille) - FAMILLES.indexOf(b.famille)
  );
  const nbTheme = (f) => INDICATEURS.filter((i) => i.famille === f && correspond(i) && couvre(i, pays)).length;
  const nbZone = (z) => INDICATEURS.filter((i) => correspond(i) && dansTheme(i) && couvre(i, z)).length;
  const nbFiltres = themes.length + (pays ? 1 : 0);
  const actif = q || nbFiltres > 0;

  const telechargerCSV = (ind) => {
    const { colonnes, lignes } = tableauComplet(ind, t);
    const nom = `uemoa_${ind.id}`;
    exporterCSV(nom, colonnes, lignes);
    setRetour(t("serie_dl_ok", { fichier: `${nom}.csv` }));
  };

  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { label: t("nav_donnees") }]}
        titre={t("explo_titre")}
        sousTitre={t("explo_chapeau", { n: INDICATEURS.length })}
        meta={[
          { label: t("meta_couverture"), valeur: t("acc_meta_couverture", { n: PAYS.length }) },
          { label: t("note_source"), valeur: "BCEAO · DBnomics" },
          ...(DATE_GENERATION ? [{ label: t("meta_maj"), valeur: fmtDate(DATE_GENERATION) }] : []),
        ]}
      />

      <section className="section section--compacte">
        <div className="conteneur">
          <div className="explo-recherche">
            <label htmlFor="explo-q" className="visuellement-cache">{t("explo_recherche")}</label>
            <Search size={18} aria-hidden="true" />
            <input
              id="explo-q"
              type="search"
              value={saisie}
              placeholder={t("explo_recherche_ph")}
              autoComplete="off"
              onChange={(e) => setSaisie(e.target.value)}
            />
          </div>

          <div className="explo">
            <button
              type="button"
              className="bouton bouton--petit explo-filtres-bouton"
              aria-expanded={filtresOuverts}
              aria-controls="explo-filtres"
              onClick={() => setFiltresOuverts(!filtresOuverts)}
            >
              <SlidersHorizontal size={15} aria-hidden="true" /> {t("explo_filtres")}
              {nbFiltres > 0 && ` (${nbFiltres})`}
            </button>

            <aside id="explo-filtres" className={`explo-filtres ${filtresOuverts ? "ouvert" : ""}`} aria-label={t("explo_filtres")}>
              <fieldset className="facette">
                <legend>{t("explo_theme")}</legend>
                {FAMILLES.map((f) => {
                  const n = nbTheme(f);
                  return (
                    <label key={f} className={n === 0 && !themes.includes(f) ? "inactif" : undefined}>
                      <input type="checkbox" checked={themes.includes(f)} onChange={() => basculerTheme(f)} />
                      <span>{t(`famille_${f}`)}</span>
                      <span className="facette-nb nombre">{n}</span>
                    </label>
                  );
                })}
              </fieldset>
              <fieldset className="facette">
                <legend>{t("explo_zone")}</legend>
                <label>
                  <input type="radio" name="explo-zone" checked={!pays} onChange={() => maj({ pays: null })} />
                  <span>{t("explo_toutes_zones")}</span>
                </label>
                {[UNION, ...PAYS].map((z) => (
                  <label key={z.id}>
                    <input type="radio" name="explo-zone" checked={pays === z.id} onChange={() => maj({ pays: z.id })} />
                    <span>{t(`zone_${z.id}`)}</span>
                    <span className="facette-nb nombre">{nbZone(z.id)}</span>
                  </label>
                ))}
              </fieldset>
              <dl className="facette facette--info">
                <dt>{t("meta_frequence")}</dt>
                <dd>{t("freq_annuelle")} ({INDICATEURS.length})</dd>
                <dt>{t("meta_nature")}</dt>
                <dd>{t("nature_officielle")} ({INDICATEURS.length})</dd>
              </dl>
            </aside>

            <div className="explo-principal">
              <div className="explo-etat">
                <p className="explo-nb" aria-live="polite">
                  <b className="nombre">{resultats.length}</b>{" "}
                  {resultats.length === 1 ? t("explo_resultat_un") : t("explo_resultats")}
                </p>
                {actif && (
                  <div className="explo-actifs">
                    {q && (
                      <button type="button" className="filtre-actif" onClick={() => { setSaisie(""); maj({ q: null }); }}>
                        « {q} » <X size={13} aria-label={t("explo_retirer", { nom: q })} />
                      </button>
                    )}
                    {themes.map((f) => (
                      <button key={f} type="button" className="filtre-actif" onClick={() => basculerTheme(f)}>
                        {t(`famille_${f}`)} <X size={13} aria-label={t("explo_retirer", { nom: t(`famille_${f}`) })} />
                      </button>
                    ))}
                    {pays && (
                      <button type="button" className="filtre-actif" onClick={() => maj({ pays: null })}>
                        {t(`zone_${pays}`)} <X size={13} aria-label={t("explo_retirer", { nom: t(`zone_${pays}`) })} />
                      </button>
                    )}
                    <button type="button" className="lien-discret" onClick={effacer}>{t("explo_effacer")}</button>
                  </div>
                )}
              </div>

              {resultats.length === 0 ? (
                <div className="explo-vide">
                  <p><b>{t("explo_aucun")}</b></p>
                  <p>{t("explo_aucun_aide")}</p>
                  <button type="button" className="bouton bouton--petit" onClick={effacer}>{t("explo_effacer")}</button>
                </div>
              ) : (
                <ul className="explo-liste" ref={listeAnimee}>
                  {resultats.map((ind) => {
                    const zoneApercu = pays && couvre(ind, pays) ? pays : "uemoa";
                    const points = serie(ind.id, zoneApercu).slice(-20);
                    const periode = pays ? [serie(ind.id, pays)[0]?.annee, serie(ind.id, pays).at(-1)?.annee] : ind.periode;
                    const lien = `/donnees/${ind.id}${pays && couvre(ind, pays) ? `?pays=${pays}` : ""}`;
                    return (
                      <li key={ind.id} className="explo-serie">
                        <Link to={lien} className="explo-serie-lien">
                          <span className="explo-serie-titre">{t(ind.libelle)}</span>
                          <span className="explo-serie-def">{t(`rg_${ind.id}_def`)}</span>
                          <span className="explo-serie-meta">
                            {libelleUnite(ind.unite)} · {ind.parPays ? t("acc_meta_couverture", { n: PAYS.length }) : t("zone_uemoa")} ·{" "}
                            <span className="nombre">{fmtPeriode(periode)}</span> · {t("freq_annuelle")} · BCEAO, {t("nature_officielle")}
                            {anneeRupture(ind.id) && <span className="mention-rupture"> · {t("explo_rupture", { annee: anneeRupture(ind.id) })}</span>}
                          </span>
                        </Link>
                        <Apercu
                          points={points}
                          rupture={anneeRupture(ind.id)}
                          label={t("explo_apercu", { zone: t(`zone_${zoneApercu}`), periode: fmtPeriode([points[0]?.annee, points.at(-1)?.annee]) })}
                        />
                        <div className="explo-serie-actions">
                          <Link to={lien} className="lien-fleche" tabIndex={-1} aria-hidden="true">
                            {t("explo_ouvrir")} <span className="fleche">→</span>
                          </Link>
                          <button type="button" className="bouton bouton--petit" onClick={() => telechargerCSV(ind)} aria-label={t("explo_csv_aria", { nom: t(ind.libelle) })}>
                            <Download size={14} aria-hidden="true" /> CSV
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="retour" role="status" aria-live="polite">{retour}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// /donnees/:id?pays= : fiche série
// ---------------------------------------------------------------------------

const PERIODES = [
  { id: "10", ans: 10 },
  { id: "20", ans: 20 },
  { id: "tout", ans: null },
];

/** Citation complète de la série affichée, avec bouton de copie. */
function Citation({ ind, zone }) {
  const { t } = useTranslation();
  const [copie, setCopie] = useState(false);
  const texte = t("citer_texte", {
    source: "BCEAO via DBnomics",
    serie: t(ind.libelle),
    zone: t(`zone_${zone}`),
    code: codeSerie(ind, zone),
    date: fmtDate(DATE_GENERATION),
    url: typeof window !== "undefined" ? window.location.href : "",
  });
  const copier = () => {
    navigator.clipboard?.writeText(texte).then(() => {
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    }, () => {});
  };
  return (
    <div className="citer">
      <h3 className="citer-titre">{t("citer_titre")}</h3>
      <p className="citer-texte">{texte}</p>
      <button type="button" className="bouton bouton--petit" onClick={copier}>{t("citer_copier")}</button>
      <span className="retour" role="status" aria-live="polite">{copie ? t("citer_copie") : ""}</span>
    </div>
  );
}

export function FicheSerie() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [periodeId, setPeriodeId] = useState("20");
  const [retour, setRetour] = useRetour();
  const reduit = useMouvementReduit();
  const ind = getIndicateur(id);
  if (!ind) return <Introuvable />;

  const zones = zonesDe(ind.id);
  const zone = zones.some((z) => z.id === params.get("pays")) ? params.get("pays") : "uemoa";
  const choisirZone = (z) => setParams(z === "uemoa" ? {} : { pays: z }, { replace: true });

  const nom = t(ind.libelle);
  const nomZone = (z) => t(`zone_${z}`);
  const unite = ind.unite;
  const pct = estPourcentage(unite);
  const avecUnion = comparableUnion(ind) && zone !== "uemoa";
  const critere = CRITERES.find((c) => c.indicateur === ind.id) || null;
  const seuil = critere ? { valeur: critere.seuil, libelle: t("serie_seuil", { seuil: `${critere.sens === "<=" ? "≤" : "≥"} ${fmtValeur(critere.seuil, unite)}` }) } : null;

  const points = serie(ind.id, zone);
  const dernier = points.at(-1);
  const precedent = points.length > 1 && points.at(-2).annee === dernier.annee - 1 ? points.at(-2) : null;
  const rupture = ruptureDe(ind.id);
  const anRupture = rupture?.premiere_annee ?? null;
  // Pas de variation à travers une rupture de périmètre.
  const varNc = !!precedent && !comparables(ind.id, precedent.annee, dernier.annee);
  const variation = precedent && !varNc ? (pct ? dernier.valeur - precedent.valeur : ((dernier.valeur - precedent.valeur) / precedent.valeur) * 100) : null;
  const vUnion = avecUnion ? valeur(ind.id, UNION.id, dernier.annee) : null;

  // Rang parmi les pays (du plus élevé au plus bas), pour l'année de la dernière valeur.
  const classement = ind.parPays
    ? PAYS.map((p) => ({ id: p.id, nom: nomZone(p.id), valeur: valeur(ind.id, p.id, dernier.annee) }))
    : [];
  const classes = classement.filter((c) => c.valeur != null).sort((a, b) => b.valeur - a.valeur);
  const rang = zone !== "uemoa" ? classes.findIndex((c) => c.id === zone) + 1 : 0;

  // Graphique : période choisie.
  const ans = PERIODES.find((p) => p.id === periodeId)?.ans;
  const debut = ans ? dernier.annee - ans + 1 : null;
  const dansPeriode = (s) => (debut ? s.filter((p) => p.annee >= debut) : s);
  const series = { [zone]: dansPeriode(points) };
  if (avecUnion) series.uemoa = dansPeriode(serie(ind.id, UNION.id));
  const noms = Object.fromEntries(zones.map((z) => [z.id, nomZone(z.id)]));

  // Historique, de la plus récente à la plus ancienne.
  const historique = [...points].reverse().map((p) => {
    const u = avecUnion ? valeur(ind.id, UNION.id, p.annee) : null;
    return { ...p, union: u, ecart: pct && u != null ? p.valeur - u : null };
  });

  // Provenance : début de série propre à la zone, zéros écartés.
  const zerosEcartes = (ZEROS_ECARTES[ind.id] || []).includes(zone);
  const debutZone = points[0]?.annee;
  const debutIndicateur = ind.periode[0];

  const telecharger = (format, toutes) => {
    const nomFichier = toutes ? `uemoa_${ind.id}` : `${zone}_${ind.id}`;
    if (toutes) {
      const { colonnes, lignes } = tableauComplet(ind, t);
      if (format === "csv") exporterCSV(nomFichier, colonnes, lignes);
      else exporterJSON(nomFichier, { indicateur: ind.id, unite, source: codeSerie(ind, "<zone>"), ...(rupture ? { rupture } : {}), donnees: lignes });
    } else {
      exporterCSV(nomFichier, [{ cle: "annee", titre: t("col_annee") }, { cle: "valeur", titre: `${nomZone(zone)} (${libelleUnite(unite)})` }], points);
    }
    setRetour(t("serie_dl_ok", { fichier: `${nomFichier}.${format}` }));
  };

  const autres = INDICATEURS.filter((i) => i.famille === ind.famille && i.id !== ind.id);
  const suffixeZone = (i) => (zone !== "uemoa" && zonesDe(i.id).some((z) => z.id === zone) ? `?pays=${zone}` : "");

  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { to: "/donnees", label: t("nav_donnees") }, { to: `/donnees?theme=${ind.famille}`, label: t(`famille_${ind.famille}`) }]}
        surtitre={t(`famille_${ind.famille}`)}
        titre={nom}
        sousTitre={t(`rg_${ind.id}_def`)}
        meta={[
          { label: t("meta_unite"), valeur: libelleUnite(unite) },
          { label: t("meta_frequence"), valeur: t("freq_annuelle") },
          { label: t("meta_periode"), valeur: `${fmtPeriode([debutZone, dernier.annee])} · ${nomZone(zone)}` },
          { label: t("meta_nature"), valeur: `${t("nature_officielle")} · BCEAO` },
          ...(DATE_GENERATION ? [{ label: t("meta_maj"), valeur: fmtDate(DATE_GENERATION) }] : []),
        ]}
      />

      {zones.length > 1 && (
        <div className="serie-zones">
          <div className="conteneur">
            <div className="serie-zones-boutons" role="group" aria-label={t("serie_zone")}>
              {zones.map((z) => (
                <button key={z.id} type="button" aria-pressed={zone === z.id} onClick={() => choisirZone(z.id)}>
                  {nomZone(z.id)}
                </button>
              ))}
            </div>
            <label className="selecteur serie-zones-liste">
              <span>{t("serie_zone")}</span>
              <select value={zone} onChange={(e) => choisirZone(e.target.value)}>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{nomZone(z.id)}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      <section className="section section--compacte">
        <Fondu cle={zone} className="conteneur serie-tete">
          <div className="serie-valeur">
            <p className="serie-valeur-lib">{t("serie_derniere", { zone: nomZone(zone), annee: dernier.annee })}</p>
            <p className="serie-valeur-chiffre nombre">{fmtValeur(dernier.valeur, unite)}</p>
          </div>
          <ul className="serie-contexte">
            {varNc && <li>{t("serie_var_nc", { annee: anRupture })}</li>}
            {variation != null && (
              <li>
                <b className="nombre">{fmtVariation(variation, pct ? "pt" : "%")}</b> {t("serie_var_an", { annee: precedent.annee })}
              </li>
            )}
            {rang > 0 && <li>{t("serie_rang", { rang, n: classes.length })}</li>}
            {vUnion != null && <li>{t("serie_union", { valeur: fmtValeur(vUnion, unite) })}</li>}
            {critere && (
              <li className={respecte(critere, dernier.valeur, dernier.annee) ? "ok" : "ko"}>
                {seuil.libelle} : {respecte(critere, dernier.valeur, dernier.annee) ? t("serie_critere_ok") : t("serie_critere_ko")}
              </li>
            )}
          </ul>
        </Fondu>
      </section>

      <section className="section section--compacte">
        <div className="conteneur">
          <section className="visu">
            <div className="visu-tete">
              <div>
                <h2>{t("serie_evolution")}</h2>
                <p>{nomZone(zone)} · {libelleUnite(unite)}</p>
              </div>
              <div className="visu-outils">
                <div className="bascule" role="group" aria-label={t("periode_label")}>
                  {PERIODES.map((p) => (
                    <button key={p.id} type="button" aria-pressed={periodeId === p.id} onClick={() => setPeriodeId(p.id)}>
                      {t(`periode_${p.id}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Fondu cle={`${zone}-${periodeId}`} className="visu-corps">
              <GraphiqueSeries series={series} unite={unite} noms={noms} hauteur={340} zero={pct} seuil={seuil} animer={!reduit} rupture={anRupture} />
              <p className="legende">
                <span><i style={{ background: "#263a7a" }} /> {nomZone(zone)}</span>
                {avecUnion && <span><i className="pointille pointille--encre" /> {t("zone_uemoa")}</span>}
                {seuil && <span><i className="pointille pointille--seuil" /> {seuil.libelle}</span>}
                {anRupture && <span><i className="trait-rupture" /> {t("rupture_graph", { annee: anRupture })}</span>}
              </p>
            </Fondu>
            <dl className="visu-notes">
              <div>
                <dt>{t("note_lecture")}</dt>
                <dd>
                  {vUnion != null
                    ? t("serie_lecture_union", { annee: dernier.annee, zone: nomZone(zone), valeur: fmtValeur(dernier.valeur, unite), union: fmtValeur(vUnion, unite) })
                    : t("serie_lecture", { annee: dernier.annee, zone: nomZone(zone), valeur: fmtValeur(dernier.valeur, unite) })}
                </dd>
              </div>
              <div>
                <dt>{t("note_source")}</dt>
                <dd>{t("source_bceao")}</dd>
              </div>
            </dl>
          </section>
        </div>
      </section>

      <section className="section section--compacte">
        <div className="conteneur serie-grille">
          <div>
            <h2 className="serie-h2">{t("serie_historique")}</h2>
            <div className="defilant serie-historique">
              <table className="tableau">
                <thead>
                  <tr>
                    <th scope="col">{t("col_annee")}</th>
                    <th scope="col" className="num">{nomZone(zone)}</th>
                    {avecUnion && <th scope="col" className="num">{t("zone_uemoa")}</th>}
                    {avecUnion && pct && <th scope="col" className="num">{t("col_ecart")}</th>}
                  </tr>
                </thead>
                <tbody>
                  {historique.map((l, i) => (
                    <Fragment key={l.annee}>
                      {anRupture && l.annee === anRupture - 1 && i > 0 && (
                        <tr className="ligne-rupture">
                          <td colSpan={2 + (avecUnion ? 1 : 0) + (avecUnion && pct ? 1 : 0)}>{t("rupture_ligne", { annee: anRupture })}</td>
                        </tr>
                      )}
                      <tr>
                        <th scope="row" className="nombre">{l.annee}</th>
                        <td className="num nombre">{fmtCourt(l.valeur, unite)}</td>
                        {avecUnion && <td className="num nombre">{fmtCourt(l.union, unite)}</td>}
                        {avecUnion && pct && <td className="num nombre">{fmtVariation(l.ecart, "pt")}</td>}
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note">{libelleUnite(unite)} · {t("source_bceao")}</p>
          </div>

          <div>
            <h2 className="serie-h2">{t("serie_provenance")}</h2>
            {rupture && <NoteRupture rupture={rupture} zone={zone} ind={ind} />}
            <ul className="serie-notes">
              <li>{t("serie_note_brut")}</li>
              {RATIOS_CONTROLES.has(ind.id) && <li>{t("serie_note_ratio", { seuil: SEUIL_ECART_MEDIAN })}</li>}
              {!ind.parPays && <li>{t("serie_note_union")}</li>}
              {zerosEcartes && <li>{t("serie_note_zeros", { zone: nomZone(zone), debut: debutIndicateur, fin: debutZone - 1 })}</li>}
              {ind.debut_retenu && <li>{t(`serie_note_debut_${ind.id}`, { annee: ind.debut_retenu })}</li>}
              {!zerosEcartes && debutZone > debutIndicateur && <li>{t("serie_note_debut", { zone: nomZone(zone), annee: debutZone })}</li>}
            </ul>
            <dl className="serie-code">
              <dt>{t("meta_source")}</dt>
              <dd><code>{codeSerie(ind, zone)}</code></dd>
            </dl>
            <Link to="/methodologie#preparation" className="lien-fleche">{t("serie_methodo")} <span className="fleche">→</span></Link>
          </div>
        </div>
      </section>

      {ind.parPays && (
        <section className="section section--compacte">
          <div className="conteneur">
            <section className="visu">
              <div className="visu-tete">
                <div>
                  <h2>{t("serie_comparaison", { annee: dernier.annee })}</h2>
                  <p>{libelleUnite(unite)}</p>
                </div>
              </div>
              <div className="visu-corps">
                <BarresPays
                  donnees={classement}
                  unite={unite}
                  union={comparableUnion(ind) ? valeur(ind.id, UNION.id, dernier.annee) : null}
                  libelleUnion={t("zone_uemoa")}
                  seuil={seuil}
                  couleur={(d) => (d.id === zone ? "#b8502a" : "#263a7a")}
                />
              </div>
              {zone !== "uemoa" && (
                <dl className="visu-notes">
                  <div>
                    <dt>{t("note_lecture")}</dt>
                    <dd>{t("serie_comparaison_lecture", { zone: nomZone(zone) })}</dd>
                  </div>
                </dl>
              )}
            </section>
          </div>
        </section>
      )}

      <section className="section section--compacte section--fin">
        <div className="conteneur serie-grille">
          <div>
            <h2 className="serie-h2">{t("serie_telecharger")}</h2>
            <div className="serie-exports">
              <button type="button" className="bouton bouton--petit" onClick={() => telecharger("csv", false)}>
                <Download size={14} aria-hidden="true" /> {t("serie_dl_zone", { zone: nomZone(zone) })}
              </button>
              {zones.length > 1 && (
                <>
                  <button type="button" className="bouton bouton--petit" onClick={() => telecharger("csv", true)}>
                    <Download size={14} aria-hidden="true" /> {t("serie_dl_tout_csv")}
                  </button>
                  <button type="button" className="bouton bouton--petit" onClick={() => telecharger("json", true)}>
                    <Download size={14} aria-hidden="true" /> {t("serie_dl_tout_json")}
                  </button>
                </>
              )}
            </div>
            <p className="retour" role="status" aria-live="polite">{retour}</p>
            {DATE_GENERATION && <Citation ind={ind} zone={zone} />}
          </div>
          <div>
            <h2 className="serie-h2">{t("serie_voir_aussi")}</h2>
            <ul className="liste-liens">
              {zone !== "uemoa" && <li><Link to={`/pays/${zone}`}>{t("serie_profil", { zone: nomZone(zone) })}</Link></li>}
              {critere && <li><Link to="/conjoncture/convergence">{t("serie_convergence")}</Link></li>}
              {autres.map((i) => (
                <li key={i.id}><Link to={`/donnees/${i.id}${suffixeZone(i)}`}>{t(i.libelle)}</Link></li>
              ))}
              <li><Link to={`/donnees?theme=${ind.famille}`}>{t("serie_autres", { famille: t(`famille_${ind.famille}`) })}</Link></li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
