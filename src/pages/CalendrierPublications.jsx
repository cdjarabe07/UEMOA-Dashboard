import { useTranslation } from "react-i18next";

// Fréquences de publication des sources officielles (clés i18n).
const DATES_PUBLICATIONS = [
  { source: "BCEAO", frequence: "cal_trimestrielle", periode: "cal_ind_pib" },
  { source: "BCEAO", frequence: "cal_mensuelle", periode: "cal_ind_ipc" },
  { source: "ANSD", frequence: "cal_mensuelle", periode: "cal_ind_ihpc" },
  { source: "FMI", frequence: "cal_semestrielle", periode: "cal_ind_weo" },
];

export default function CalendrierPublications() {
  const { t } = useTranslation();
  return (
    <section className="calendrier-publications">
      <h2 className="section-heading">{t("cal_titre")}</h2>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("cal_source")}</th>
              <th>{t("cal_frequence")}</th>
              <th>{t("cal_indicateurs")}</th>
            </tr>
          </thead>
          <tbody>
            {DATES_PUBLICATIONS.map((d, i) => (
              <tr key={i}>
                <td><b>{d.source}</b></td>
                <td>{t(d.frequence)}</td>
                <td>{t(d.periode)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
