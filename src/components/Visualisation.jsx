import { useState } from "react";
import { useTranslation } from "react-i18next";
import Fondu from "./Fondu.jsx";

/**
 * Bloc de visualisation : bascule Graphique / Tableau, puis notes de lecture.
 * graphique et tableau sont des éléments React ; notes = { lecture, champ, source }.
 * outils : contrôles affichés à droite du titre (sélecteurs).
 */
export default function Visualisation({ titre, sousTitre, graphique, tableau, notes = {}, outils }) {
  const { t } = useTranslation();
  const [vue, setVue] = useState("graphique");
  return (
    <section className="visu">
      <div className="visu-tete">
        <div>
          <h2>{titre}</h2>
          {sousTitre && <p>{sousTitre}</p>}
        </div>
        <div className="visu-outils">
          {outils}
          {tableau && (
            <div className="bascule" role="group" aria-label={t("visu_vue")}>
              {["graphique", "tableau"].map((v) => (
                <button key={v} type="button" aria-pressed={vue === v} onClick={() => setVue(v)}>
                  {t(`visu_${v}`)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Fondu cle={vue} className="visu-corps">{vue === "graphique" || !tableau ? graphique : tableau}</Fondu>
      {(notes.lecture || notes.champ || notes.source) && (
        <dl className="visu-notes">
          {notes.lecture && (
            <div>
              <dt>{t("note_lecture")}</dt>
              <dd>{notes.lecture}</dd>
            </div>
          )}
          {notes.champ && (
            <div>
              <dt>{t("note_champ")}</dt>
              <dd>{notes.champ}</dd>
            </div>
          )}
          {notes.source && (
            <div>
              <dt>{t("note_source")}</dt>
              <dd>{notes.source}</dd>
            </div>
          )}
        </dl>
      )}
    </section>
  );
}
