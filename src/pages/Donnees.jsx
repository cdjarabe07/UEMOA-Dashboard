import { useState } from "react";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { INDICATEURS } from "../data/indicateurs.js";
import {
  DATE_MAJ,
  nomIndicateur,
  construireSerie,
  GraphiquePrevision,
  LegendePrevision,
  TamponMAE,
  BandeauPage,
} from "./Visuels";


function formatValeur(valeur, unite) {
  const arrondi = Number.isInteger(valeur) ? valeur : Number(valeur.toFixed(1));
  return `${arrondi.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} ${unite}`;
}

function telechargerCSV(indicateur) {
  const entetes = "period,value,type\n";
  const lignes = indicateur.historique
    .map((ligne) => `${ligne.period},${ligne.value},observation`)
    .join("\n");
  const contenu = entetes + lignes;
  const blob = new Blob([contenu], { type: "text/csv;charset=utf-8;" });
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(blob);
  lien.download = `${indicateur.id}.csv`;
  lien.click();
}

function telechargerJSON(indicateur) {
  const contenu = JSON.stringify(indicateur.historique, null, 2);
  const blob = new Blob([contenu], { type: "application/json" });
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(blob);
  lien.download = `${indicateur.id}.json`;
  lien.click();
}

function telechargerPDF(indicateur) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(indicateur.nom, 14, 16);
  doc.setFontSize(10);
  doc.text("Source : BCEAO, via DBnomics", 14, 22);
  autoTable(doc, {
    startY: 28,
    head: [["Année", `Valeur (${indicateur.unite})`]],
    body: indicateur.historique.map((ligne) => [ligne.period, ligne.value]),
  });
  doc.save(`${indicateur.id}.pdf`);
}

export default function Donnees() {
  const { t } = useTranslation();
  const [actifId, setActifId] = useState(INDICATEURS[0].id);
  const indicateur = INDICATEURS.find((i) => i.id === actifId);
  const historique = indicateur?.historique || [];
  const previsions = indicateur?.previsions || [];

  // Période couverte, calculée depuis les données réelles.
  const anneeDebut = historique.length ? parseInt(historique[0].period.slice(0, 4), 10) : null;
  const anneeFin = historique.length ? parseInt(historique[historique.length - 1].period.slice(0, 4), 10) : null;
  const prevAnnees = previsions.map((p) => p.annee);
  const fin = prevAnnees.length ? Math.max(anneeFin ?? 0, Math.max(...prevAnnees)) : anneeFin;
  const periodeTexte =
    anneeDebut != null ? `${anneeDebut}–${fin != null ? fin : ""}` : t("comparer_nd");

  // Dernière observation disponible.
  const derObs =
    historique.length
      ? {
          annee: parseInt(historique[historique.length - 1].period.slice(0, 4), 10),
          valeur: historique[historique.length - 1].value,
        }
      : null;

  // Lignes de la table (observations puis prévisions).
  const rows = [
    ...historique.map((o) => ({
      periode: o.period.slice(0, 4),
      type: "obs",
      valeur: o.value,
      ic: null,
    })),
    ...previsions.map((p) => ({
      periode: `${p.annee}`,
      type: "prev",
      valeur: p.valeur_prevue,
      ic:
        p.borne_basse != null && p.borne_haute != null
          ? `${formatValeur(p.borne_basse, indicateur.unite)} – ${formatValeur(p.borne_haute, indicateur.unite)}`
          : null,
    })),
  ];

  const libelles = {
    obs: t("donnees3_legend_obs"),
    prev: t("donnees3_legend_prev"),
    ic: t("prevision_ic"),
  };
  const nom = nomIndicateur(t, indicateur.id);

  return (
    <div className="page-full">
      <BandeauPage
        eyebrow={t("donnees3_eyebrow")}
        titre={t("donnees3_titre")}
        sous={t("donnees3_desc")}
        meta={[
          `${t("footer_datemaj")} : ${DATE_MAJ ? `${DATE_MAJ} UTC` : t("comparer_nd")}`,
          `${t("footer_sources")} : BCEAO · DBnomics`,
        ]}
      />

      <div className="page page--data">
        {/* 1. Sélection de l'indicateur */}
        <nav className="tabs data-tabs" role="tablist" aria-label={t("donnees_hero_eyebrow")}>
          {INDICATEURS.map((i) => (
            <button
              key={i.id}
              className="tab"
              role="tab"
              aria-selected={i.id === actifId}
              data-active={i.id === actifId}
              onClick={() => setActifId(i.id)}
            >
              {nomIndicateur(t, i.id)}
            </button>
          ))}
        </nav>

        {/* 2. En-tête de série */}
        <section className="series-head">
          <div>
            <h2 className="series-title">{nom}</h2>
            <p className="series-sub">{t(`ind_${indicateur.id}_sous`, { defaultValue: indicateur.sousTitre })}</p>
          </div>
          <div className="series-meta">
            <span>{t("accueil2_col_unite")} : <b>{indicateur.unite}</b></span>
            <span>{t("donnees3_periode")} : <b>{periodeTexte}</b></span>
            <span>
              {t("donnees3_type")} :{" "}
              <b>{previsions.length > 0 ? t("donnees3_type_obs_prev") : t("donnees3_type_obs")}</b>
            </span>
          </div>
        </section>

        {/* 3. Valeurs : dernière observation + prévisions */}
        <div className="values-strip" role="group" aria-label={t("donnees3_titre")}>
          <div className="value-box">
            <p className="value-label">{t("donnees3_derniere_obs")}</p>
            <p className="value-digit">{derObs ? formatValeur(derObs.valeur, indicateur.unite) : t("comparer_nd")}</p>
            <p className="value-period">{t("donnees3_annee")} : {derObs ? derObs.annee : t("comparer_nd")}</p>
          </div>
          {previsions.length > 0 ? (
            previsions.map((p) => (
              <div key={p.annee} className="value-box value-box--prev">
                <p className="value-label">{t("prevision_label")} {p.annee}</p>
                <p className="value-digit">{formatValeur(p.valeur_prevue, indicateur.unite)}</p>
                {p.borne_basse != null && p.borne_haute != null && (
                  <p className="value-period">
                    {t("prevision_ic")} : {formatValeur(p.borne_basse, indicateur.unite)} –{" "}
                    {formatValeur(p.borne_haute, indicateur.unite)}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="value-box value-box--muted">
              <p className="value-label">{t("prevision_label")} 2026–2027</p>
              <p className="value-digit">—</p>
              <p className="value-period">{t("prevision_indisponible")}</p>
            </div>
          )}
        </div>

        {/* 4. Graphique principal + précision du modèle + exports */}
        {historique.length > 1 && (
          <section className="entry-body" aria-label={nom}>
            <div className="chart-card">
              <div className="chart-card-head">
                <h3>{nom}</h3>
                <span>{indicateur.unite}</span>
              </div>
              <GraphiquePrevision
                data={construireSerie(historique, previsions)}
                unite={indicateur.unite}
                libelles={libelles}
                height={340}
              />
              <LegendePrevision libelles={libelles} avecPrevision={previsions.length > 0} />
              <p className="chart-card-foot">
                {t("donnees_footer_source")} · {t("donnees3_periode")} : {periodeTexte}
              </p>
            </div>
            <aside className="entry-aside">
              <TamponMAE
                mae={indicateur.mae}
                ordre={indicateur.ordreSarima}
                kicker={t("precision_mae")}
                caption={t("precision_caption")}
              />
              <div className="downloads">
                <span className="downloads-label">{t("donnees3_download")}</span>
                <button onClick={() => telechargerCSV(indicateur)}>{t("telecharger_csv")}</button>
                <button onClick={() => telechargerJSON(indicateur)}>{t("telecharger_json")}</button>
                <button onClick={() => telechargerPDF(indicateur)}>{t("telecharger_pdf")}</button>
              </div>
            </aside>
          </section>
        )}

        {/* 5. Table de données (plus récentes en premier) */}
        <section className="home-section" aria-label={`${nom} — ${t("donnees3_titre")}`}>
          <h2 className="section-heading">{nom} — {t("donnees3_table_titre")}</h2>
          <div className="table-scroll table-scroll--tall">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("donnees3_periode")}</th>
                  <th className="num">{t("donnees3_valeur")} ({indicateur.unite})</th>
                  <th>{t("donnees3_type")}</th>
                  <th className="num">{t("prevision_ic")}</th>
                </tr>
              </thead>
              <tbody>
                {[...rows].reverse().map((r) => (
                  <tr key={`${r.periode}-${r.type}`} className={r.type === "prev" ? "row-prev" : undefined}>
                    <td>{r.periode}</td>
                    <td className="num">{formatValeur(r.valeur, indicateur.unite)}</td>
                    <td>
                      {r.type === "obs" ? (
                        t("donnees3_type_obs")
                      ) : (
                        <span className="pill-prev">{t("prevision_label")}</span>
                      )}
                    </td>
                    <td className="num muted">{r.ic ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. Métadonnées */}
        <section className="home-section" aria-label={t("accueil2_src_titre")}>
          <h2 className="section-heading">{t("accueil2_src_titre")}</h2>
          <div className="metadata">
            <div className="metadata-row">
              <b>{t("footer_sources")}</b>
              <span>BCEAO · DBnomics</span>
            </div>
            <div className="metadata-row">
              <b>{t("footer_datemaj")}</b>
              <span>{DATE_MAJ ? `${DATE_MAJ} UTC` : t("comparer_nd")}</span>
            </div>
            <div className="metadata-row">
              <b>{t("accueil2_col_unite")}</b>
              <span>{indicateur.unite}</span>
            </div>
            <div className="metadata-row">
              <b>{t("donnees3_periode")}</b>
              <span>{periodeTexte}</span>
            </div>
            <div className="metadata-row">
              <b>{t("donnees3_meta_modele")}</b>
              <span>SARIMA {indicateur.ordreSarima} · MAE {indicateur.mae} ({t("precision_caption")})</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}