// Liste d'événements de l'agenda : date (ou période), institution, intitulé et lien
// vers la page officielle. Les intitulés de la BCEAO sont en français ; en anglais,
// les réunions récurrentes reçoivent un libellé traduit, les autres sont signalées (FR).
import { useTranslation } from "react-i18next";
import { locale } from "../lib/format.js";

const TRADUITS = new Set(["cpm", "conseil_ministres", "rapport_annuel"]);

export const dateLongue = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale(), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function useIntitule() {
  const { t, i18n } = useTranslation();
  const en = i18n.language?.startsWith("en");
  return (e) => {
    if (!en) return e.titre.fr;
    if (e.titre.en) return e.titre.en;
    if (e.institution === "BCEAO" && TRADUITS.has(e.type)) return t(`agenda_type_${e.type}`);
    return `${e.titre.fr} (FR)`;
  };
}

const OPTIONS = { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" };
// Période compacte : « 12–18 octobre 2026 » (Intl.formatRange), sinon date simple.
export const periode = (e) => {
  if (!e.date_fin || e.date_fin === e.date) return dateLongue(e.date);
  const [a, b] = [e.date, e.date_fin].map((d) => new Date(`${d}T00:00:00Z`));
  const f = new Intl.DateTimeFormat(locale(), OPTIONS);
  return f.formatRange ? f.formatRange(a, b) : `${dateLongue(e.date)} – ${dateLongue(e.date_fin)}`;
};

export default function Agenda({ evenements, vide }) {
  const { t } = useTranslation();
  const intitule = useIntitule();
  if (!evenements.length) return <p className="texte-sobre">{vide}</p>;
  return (
    <ol className="agenda">
      {evenements.map((e) => (
        <li key={e.id}>
          <time dateTime={e.date}>{periode(e)}</time>
          <a href={e.url} target="_blank" rel="noreferrer">
            <span className="agenda-inst">{t(`institution_${e.institution}`, { defaultValue: e.institution })}</span>
            <span className="agenda-titre">{intitule(e)}</span>
            <span className="agenda-lien">{t("agenda_page_officielle")} <span aria-hidden="true">↗</span></span>
          </a>
        </li>
      ))}
    </ol>
  );
}
