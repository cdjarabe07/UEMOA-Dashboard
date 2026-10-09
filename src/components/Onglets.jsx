import { useId, useState } from "react";
import Fondu from "./Fondu.jsx";

/**
 * Onglets : un seul contenu affiché à la fois.
 * onglets = [{ id, libelle, contenu }]
 */
export default function Onglets({ onglets, label, initial }) {
  const [actif, setActif] = useState(initial || onglets[0]?.id);
  const base = useId();
  const courant = onglets.find((o) => o.id === actif) || onglets[0];
  return (
    <div className="onglets">
      <div className="onglets-liste" role="tablist" aria-label={label}>
        {onglets.map((o) => (
          <button
            key={o.id}
            type="button"
            role="tab"
            id={`${base}-${o.id}`}
            aria-selected={o.id === courant.id}
            aria-controls={`${base}-panneau`}
            onClick={() => setActif(o.id)}
          >
            {o.libelle}
          </button>
        ))}
      </div>
      <div className="onglets-panneau" role="tabpanel" id={`${base}-panneau`} aria-labelledby={`${base}-${courant.id}`}>
        <Fondu cle={courant.id}>{courant.contenu}</Fondu>
      </div>
    </div>
  );
}
