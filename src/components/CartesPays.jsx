import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { PAYS, valeur, derniereAnnee } from "../data/portail.js";
import { fmtCourt } from "../lib/format.js";
import { COULEUR_ZONE } from "./Graphiques.jsx";

/** Grille d'accès aux huit profils pays (un clic = la fiche du pays). */
export default function CartesPays() {
  const { t } = useTranslation();
  const an = derniereAnnee("croissance_reelle");
  return (
    <ul className="cartes-pays">
      {PAYS.map((p) => (
        <li key={p.id}>
          <Link to={`/pays/${p.id}`} className="carte-pays" style={{ "--couleur-pays": COULEUR_ZONE[p.id] }}>
            <span className="carte-pays-iso">{p.iso3}</span>
            <span className="carte-pays-nom">{t(`zone_${p.id}`)}</span>
            <span className="carte-pays-chiffre">
              {t("rg_croissance_reelle_court")} {an} :{" "}
              <b className="nombre">{fmtCourt(valeur("croissance_reelle", p.id, an), "%")}</b>
            </span>
            <span className="carte-pays-lien">
              {t("pays_voir_profil")} <ArrowRight size={15} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
