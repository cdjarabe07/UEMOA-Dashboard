// Métadonnées de génération des données (meta.json, écrit par le pipeline).
import metaData from "../data/meta.json";
import { GENERATED_AT as PORTAIL_GENERATED_AT } from "../data/portail.js";

// Date de génération la plus récente parmi les exports du pipeline
// (export_dashboard.py -> meta.json, export_portail.py -> portail.json).
export const DATE_GENERATION = (() => {
  const dates = [metaData?.generated_at, PORTAIL_GENERATED_AT]
    .filter((d) => typeof d === "string")
    .map((d) => new Date(d))
    .filter((d) => !Number.isNaN(d.getTime()));
  return dates.length ? new Date(Math.max(...dates)) : null;
})();

export const SOURCES = ["BCEAO", "DBnomics"];
