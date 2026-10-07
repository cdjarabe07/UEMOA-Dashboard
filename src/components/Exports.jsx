import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";
import { exporterCSV, exporterJSON, exporterPDF } from "../lib/export.js";

/** Boutons d'export pour un tableau : colonnes [{cle, titre}], lignes [{...}]. */
export default function Exports({ nom, titre, colonnes, lignes }) {
  const { t } = useTranslation();
  const sousTitre = t("export_source");
  return (
    <div className="exports">
      <span>
        <Download size={15} aria-hidden="true" /> {t("export_titre")}
      </span>
      <button type="button" className="bouton bouton--petit" onClick={() => exporterCSV(nom, colonnes, lignes)}>CSV</button>
      <button type="button" className="bouton bouton--petit" onClick={() => exporterJSON(nom, lignes)}>JSON</button>
      <button type="button" className="bouton bouton--petit" onClick={() => exporterPDF(nom, titre, sousTitre, colonnes, lignes)}>PDF</button>
    </div>
  );
}
