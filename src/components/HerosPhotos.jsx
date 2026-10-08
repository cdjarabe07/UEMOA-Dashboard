// Photos du grand visuel de l'accueil : alternance lente des capitales de l'Union,
// avec ville et crédit. Pause par bouton ; aucune alternance si l'appareil
// demande de réduire les animations.
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PHOTOS } from "../contenu/photos.js";
import { useMouvementReduit } from "../lib/mouvement.js";

const DUREE = 8000;

export default function HerosPhotos() {
  const { t } = useTranslation();
  const reduit = useMouvementReduit();
  const [i, setI] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (reduit || pause || PHOTOS.length < 2) return undefined;
    const id = setInterval(() => {
      if (!document.hidden) setI((n) => (n + 1) % PHOTOS.length);
    }, DUREE);
    return () => clearInterval(id);
  }, [reduit, pause]);

  if (!PHOTOS.length) return null;
  const p = PHOTOS[i];
  return (
    <>
      <div className="heros-photos" aria-hidden="true">
        {PHOTOS.map((x, n) => (
          <img key={x.zone} src={x.url} alt="" className={n === i ? "actif" : undefined} loading={n === 0 ? "eager" : "lazy"} />
        ))}
      </div>
      <div className="heros-voile" aria-hidden="true" />
      <div className="heros-legende">
        <p>
          <b>{p.ville}</b>, {t(`zone_${p.zone}`)} ·{" "}
          {t("photo_credit", { auteur: p.auteur })}{" "}
          <a href={p.licence_url} target="_blank" rel="noreferrer">{p.licence}</a>,{" "}
          <a href={p.source} target="_blank" rel="noreferrer">Wikimedia Commons</a>
        </p>
        {PHOTOS.length > 1 && (
          <div className="heros-commandes">
            {PHOTOS.map((x, n) => (
              <button
                key={x.zone}
                type="button"
                className="heros-point"
                aria-pressed={n === i}
                aria-label={t("photo_afficher", { ville: x.ville })}
                onClick={() => setI(n)}
              />
            ))}
            {!reduit && (
              <button type="button" className="heros-pause" onClick={() => setPause(!pause)} aria-pressed={pause}>
                {pause ? t("bc_reprendre") : t("bc_pause")}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/** Photo de la capitale en tête d'un profil pays, avec crédit. */
export function PhotoPays({ photo }) {
  const { t } = useTranslation();
  if (!photo) return null;
  return (
    <figure className="photo-pays">
      <img src={photo.url} alt={t("photo_alt", { ville: photo.ville })} loading="lazy" />
      <figcaption>
        <b>{photo.ville}</b> · {t("photo_credit", { auteur: photo.auteur })}{" "}
        <a href={photo.licence_url} target="_blank" rel="noreferrer">{photo.licence}</a>,{" "}
        <a href={photo.source} target="_blank" rel="noreferrer">Wikimedia Commons</a>
      </figcaption>
    </figure>
  );
}
