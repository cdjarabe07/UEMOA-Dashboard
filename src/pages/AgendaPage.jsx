import { useTranslation } from "react-i18next";
import Bandeau from "../components/Bandeau.jsx";
import Agenda from "../components/Agenda.jsx";
import { AGENDA, evenementsAVenir, evenementsPasses } from "../data/agenda.js";
import { fmtDate } from "../lib/format.js";

/** /agenda : événements annoncés par les institutions, à venir puis passés. */
export default function AgendaPage() {
  const { t } = useTranslation();
  const avenir = evenementsAVenir();
  const passes = evenementsPasses();
  const maj = AGENDA.generated_at ? fmtDate(new Date(AGENDA.generated_at)) : "—";
  return (
    <>
      <Bandeau
        fil={[{ to: "/", label: t("accueil") }, { label: t("agenda_titre") }]}
        titre={t("agenda_titre")}
        sousTitre={t("agenda_chapeau")}
        meta={[
          { label: t("agenda_meta_avenir"), valeur: String(avenir.length) },
          { label: t("meta_maj"), valeur: maj },
        ]}
      />
      <section className="section section--compacte section--fin">
        <div className="conteneur colonnes-editoriales">
          <div>
            <h2 className="titre-colonne">{t("agenda_avenir")}</h2>
            <Agenda evenements={avenir} vide={t("agenda_aucun_avenir")} />
            <h2 className="titre-colonne agenda-passes-titre">{t("agenda_passes")}</h2>
            <Agenda evenements={passes} vide={t("agenda_aucun_passe")} />
          </div>
          <div className="pub-regles">
            <h2 className="titre-colonne">{t("agenda_regles_titre")}</h2>
            <ul className="liste-simple">
              <li>{t("agenda_regle_1")}</li>
              <li>{t("agenda_regle_2")}</li>
              <li>{t("agenda_regle_3")}</li>
            </ul>
            <p className="note">
              {t("agenda_sources")}{" "}
              <a href={AGENDA.sources?.[0]?.url} target="_blank" rel="noreferrer">BCEAO, {t("agenda_page_evenements")}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
