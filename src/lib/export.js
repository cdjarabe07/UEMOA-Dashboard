// Exports de données (CSV, JSON, PDF) — uniquement des données affichées.
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function telecharger(contenu, type, nomFichier) {
  const url = URL.createObjectURL(new Blob([contenu], { type }));
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  lien.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const echapper = (v) => {
  const s = v == null ? "" : String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** colonnes = [{cle, titre}], lignes = [{cle: valeur}] */
export function exporterCSV(nom, colonnes, lignes) {
  const entete = colonnes.map((c) => echapper(c.titre)).join(",");
  const corps = lignes.map((l) => colonnes.map((c) => echapper(l[c.cle])).join(",")).join("\n");
  telecharger("﻿" + entete + "\n" + corps, "text/csv;charset=utf-8", `${nom}.csv`);
}

export function exporterJSON(nom, donnees) {
  telecharger(JSON.stringify(donnees, null, 2), "application/json", `${nom}.json`);
}

export function exporterPDF(nom, titre, sousTitre, colonnes, lignes) {
  const doc = new jsPDF({ orientation: colonnes.length > 6 ? "landscape" : "portrait" });
  doc.setFontSize(14);
  doc.text(titre, 14, 16);
  doc.setFontSize(9);
  doc.text(sousTitre, 14, 22);
  autoTable(doc, {
    startY: 28,
    head: [colonnes.map((c) => c.titre)],
    body: lignes.map((l) => colonnes.map((c) => (l[c.cle] == null ? "" : String(l[c.cle])))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [38, 58, 122] },
  });
  doc.save(`${nom}.pdf`);
}
