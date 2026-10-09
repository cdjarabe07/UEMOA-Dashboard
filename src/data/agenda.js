// Agenda institutionnel (agenda.json, écrit par previsions-macro-uemoa/export_agenda.py) :
// événements annoncés par la BCEAO, le FMI et la Banque mondiale, avec leur lien officiel.
import agenda from "./agenda.json";

export const AGENDA = agenda;
export const EVENEMENTS = agenda.evenements || [];

const aujourdhui = () => new Date().toISOString().slice(0, 10);
const fin = (e) => e.date_fin || e.date;

/** Événements à venir ou en cours, du plus proche au plus lointain. */
export const evenementsAVenir = (jour = aujourdhui()) =>
  EVENEMENTS.filter((e) => fin(e) >= jour).sort((a, b) => a.date.localeCompare(b.date));

/** Événements passés, du plus récent au plus ancien. */
export const evenementsPasses = (jour = aujourdhui()) =>
  EVENEMENTS.filter((e) => fin(e) < jour).sort((a, b) => b.date.localeCompare(a.date));
