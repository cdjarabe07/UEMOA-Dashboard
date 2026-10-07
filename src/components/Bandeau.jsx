import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Bandeau de page (inspiré des pages « chiffres clés » des instituts
 * statistiques) : titre et période à gauche, métadonnées et actions à droite.
 * fil = [{to, label}], meta = [{label, valeur}]
 */
export default function Bandeau({ fil = [], surtitre, titre, sousTitre, meta = [], children }) {
  const { t } = useTranslation();
  return (
    <header className="bandeau">
      <div className="conteneur bandeau-grille">
        <div className="bandeau-principal">
          {fil.length > 0 && (
            <nav className="bandeau-fil" aria-label={t("fil")}>
              {fil.map((f, i) => (
                <span key={i}>
                  {f.to ? <Link to={f.to}>{f.label}</Link> : f.label}
                  {i < fil.length - 1 && " › "}
                </span>
              ))}
            </nav>
          )}
          {surtitre && <p className="bandeau-surtitre">{surtitre}</p>}
          <h1>{titre}</h1>
          {sousTitre && <p className="bandeau-sous-titre">{sousTitre}</p>}
        </div>
        {(meta.length > 0 || children) && (
          <aside className="bandeau-cote">
            {meta.length > 0 && (
              <dl>
                {meta.map((m) => (
                  <div key={m.label}>
                    <dt>{m.label}</dt>
                    <dd>{m.valeur}</dd>
                  </div>
                ))}
              </dl>
            )}
            {children}
          </aside>
        )}
      </div>
      <div className="motif motif--fin" />
    </header>
  );
}
