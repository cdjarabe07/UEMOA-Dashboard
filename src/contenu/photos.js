// Photos des capitales (Wikimedia Commons, licences libres), téléchargées par
// scripts/telecharger_photos.py. Chaque photo est affichée avec son crédit.
import credits from "./photos.json";

const fichiers = import.meta.glob("../assets/photos/*.jpg", { eager: true, import: "default" });
const url = (fichier) => fichiers[`../assets/photos/${fichier}`];

export const PHOTOS = credits.map((c) => ({ ...c, url: url(c.fichier) })).filter((c) => c.url);
export const photoDe = (zone) => PHOTOS.find((p) => p.zone === zone) || null;
