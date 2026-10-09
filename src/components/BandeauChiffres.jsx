// Bandeau défilant de chiffres réels (dernière valeur, date, source), sur le
// modèle des bandeaux de taux des banques centrales. Pause au survol, au focus
// et par bouton ; fixe si l'appareil demande de réduire les animations.
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UNION, valeur, derniereAnnee, serie } from "../data/portail.js";
import { getProduit, resumePrix } from "../data/fmi.js";
import { fmtMois, fmtNombre, fmtValeur } from "../lib/format.js";

function elements(t) {
  const union = (id) => {
    const an = derniereAnnee(id);
    return { annee: an, v: valeur(id, UNION.id, an) };
  };
  const liste = [];
  for (const [id, unite] of [["croissance_reelle", "%"], ["inflation", "%"], ["solde_budgetaire_pib", "% du PIB"], ["dette_pib", "% du PIB"]]) {
    const { annee, v } = union(id);
    if (v != null) liste.push({ cle: id, libelle: t(`bc_${id}`, { annee }), valeur: fmtValeur(v, unite), lien: `/donnees/${id}` });
  }
  const change = serie("taux_change_usd", UNION.id).at(-1);
  if (change) liste.push({ cle: "change", libelle: t("bc_change", { annee: change.annee }), valeur: fmtNombre(change.valeur, 1, true), lien: "/donnees/taux_change_usd" });
  for (const id of ["petrole", "cacao", "or", "coton"]) {
    const p = getProduit(id);
    if (!p) continue;
    const r = resumePrix(p);
    liste.push({
      cle: id,
      libelle: t("bc_prix", { produit: t(`mp_${id}`), mois: fmtMois(r.mois) }),
      valeur: `${fmtNombre(r.valeur, r.valeur < 100 ? 1 : 0)} ${t(`mp_unite_${id}`)}`,
      lien: "/conjoncture#international",
    });
  }
  return liste;
}

export default function BandeauChiffres() {
  const { t } = useTranslation();
  const [pause, setPause] = useState(false);
  const liste = elements(t);
  const rangee = (cache) => (
    <ul className="bc-rangee" aria-hidden={cache || undefined}>
      {liste.map((e) => (
        <li key={e.cle}>
          <Link to={e.lien} tabIndex={cache ? -1 : undefined}>
            <span className="bc-libelle">{e.libelle}</span> <b className="nombre">{e.valeur}</b>
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <section className={`bc${pause ? " bc--pause" : ""}`} aria-label={t("bc_titre")}>
      <div className="bc-piste">
        <div className="bc-defilement">
          {rangee(false)}
          {rangee(true)}
        </div>
      </div>
      <button type="button" className="bc-bouton" onClick={() => setPause(!pause)} aria-pressed={pause}>
        {pause ? t("bc_reprendre") : t("bc_pause")}
      </button>
    </section>
  );
}
