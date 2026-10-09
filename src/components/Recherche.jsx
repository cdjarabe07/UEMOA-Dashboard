// Recherche globale (cmdk) : Ctrl+K ou ⌘K, ou le bouton de l'en-tête.
// Pages, pays, séries, séries par pays, dossiers, analyses publiées, publications.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Command } from "cmdk";
import { PAYS, INDICATEURS, zonesDe } from "../data/portail.js";
import { ANALYSES, DOSSIERS, PUBLICATIONS } from "../contenu/index.js";

export const OUVRIR_RECHERCHE = "observatoire:recherche";

// Recherche par mots entiers, sans accents ni casse : tous les mots tapés doivent
// apparaître (« dette niger » ne trouve que la dette du Niger).
const normaliser = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const filtrer = (valeur, saisie) => {
  const mots = normaliser(saisie).split(/\s+/).filter(Boolean);
  const v = normaliser(valeur);
  return mots.every((m) => v.includes(m)) ? 1 : 0;
};

const PAGES = [
  ["/", "accueil"],
  ["/conjoncture", "nav_conjoncture"],
  ["/conjoncture/convergence", "nav_convergence"],
  ["/conjoncture/previsions", "nav_previsions"],
  ["/conjoncture#international", "conj_international_titre"],
  ["/conjoncture#projections", "conj_projections_titre"],
  ["/conjoncture#inflation-mensuelle", "im_section_titre"],
  ["/analyses", "nav_analyses"],
  ["/pays", "nav_pays"],
  ["/donnees", "explo_titre"],
  ["/publications", "nav_publications"],
  ["/methodologie", "nav_methodologie"],
  ["/methodologie#ruptures", "meth_ruptures_titre"],
];

export default function Recherche() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [ouvert, setOuvert] = useState(false);
  const [saisie, setSaisie] = useState("");

  useEffect(() => {
    const clavier = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOuvert((o) => !o);
      }
    };
    const bouton = () => setOuvert(true);
    window.addEventListener("keydown", clavier);
    window.addEventListener(OUVRIR_RECHERCHE, bouton);
    return () => {
      window.removeEventListener("keydown", clavier);
      window.removeEventListener(OUVRIR_RECHERCHE, bouton);
    };
  }, []);

  useEffect(() => {
    if (!ouvert) setSaisie("");
  }, [ouvert]);

  const aller = (chemin) => {
    setOuvert(false);
    navigate(chemin);
  };

  return (
    <Command.Dialog open={ouvert} onOpenChange={setOuvert} label={t("rech_titre")} className="recherche" overlayClassName="recherche-voile" filter={filtrer}>
      <Command.Input value={saisie} onValueChange={setSaisie} placeholder={t("rech_placeholder")} className="recherche-champ" />
      <Command.List className="recherche-liste">
        <Command.Empty className="recherche-vide">{t("rech_aucun")}</Command.Empty>

        <Command.Group heading={t("rech_pages")}>
          {PAGES.map(([chemin, cle]) => (
            <Command.Item key={chemin} value={`page ${t(cle)}`} onSelect={() => aller(chemin)}>
              {t(cle)}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading={t("nav_pays")}>
          {PAYS.map((p) => (
            <Command.Item key={p.id} value={`pays ${t(`zone_${p.id}`)} ${p.iso3}`} onSelect={() => aller(`/pays/${p.id}`)}>
              {t(`zone_${p.id}`)} <span className="recherche-type">{t("rech_profil")}</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading={t("rech_series")}>
          {INDICATEURS.map((i) => (
            <Command.Item key={i.id} value={`serie ${t(i.libelle)} ${t(i.court)} ${t(`famille_${i.famille}`)}`} onSelect={() => aller(`/donnees/${i.id}`)}>
              {t(i.libelle)} <span className="recherche-type">{t(`famille_${i.famille}`)}</span>
            </Command.Item>
          ))}
        </Command.Group>

        {/* Combinaisons série × pays, seulement quand on tape quelque chose. */}
        {saisie.trim().length > 1 && (
          <Command.Group heading={t("rech_series_pays")}>
            {INDICATEURS.flatMap((i) =>
              zonesDe(i.id)
                .filter((z) => z.id !== "uemoa")
                .map((z) => (
                  <Command.Item
                    key={`${i.id}-${z.id}`}
                    value={`${t(i.court)} ${t(i.libelle)} ${t(`zone_${z.id}`)}`}
                    onSelect={() => aller(`/donnees/${i.id}?pays=${z.id}`)}
                  >
                    {t(i.court)} · {t(`zone_${z.id}`)}
                  </Command.Item>
                ))
            )}
          </Command.Group>
        )}

        <Command.Group heading={t("dossiers_titre")}>
          {DOSSIERS.map((d) => (
            <Command.Item key={d.id} value={`dossier ${t(`dossier_${d.id}`)}`} onSelect={() => aller(`/analyses/dossiers/${d.id}`)}>
              {t(`dossier_${d.id}`)}
            </Command.Item>
          ))}
        </Command.Group>

        {ANALYSES.filter((a) => a.statut === "publiee").length > 0 && (
          <Command.Group heading={t("analyses_liste_titre")}>
            {ANALYSES.filter((a) => a.statut === "publiee").map((a) => (
              <Command.Item key={a.id} value={`analyse ${a.titre.fr} ${a.titre.en}`} onSelect={() => aller(`/analyses/${a.id}`)}>
                {a.titre.fr}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        <Command.Group heading={t("nav_publications")}>
          {PUBLICATIONS.map((p) => (
            <Command.Item
              key={p.id}
              value={`publication ${p.institution} ${t(`institution_${p.institution}`, { defaultValue: p.institution })} ${p.titre} ${p.edition}`}
              onSelect={() => {
                setOuvert(false);
                window.open(p.url, "_blank", "noopener");
              }}
            >
              {t(`institution_${p.institution}`, { defaultValue: p.institution })} · {p.titre} <span className="recherche-type">↗</span>
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
      <p className="recherche-aide">{t("rech_aide")}</p>
    </Command.Dialog>
  );
}
