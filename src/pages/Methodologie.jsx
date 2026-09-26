import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Database, ChartLine, TriangleAlert, CalendarClock, BellRing } from "lucide-react";
import CalendrierPublications from "./CalendrierPublications";
import { BandeauPage, DATE_MAJ } from "./Visuels";

export default function Methodologie() {
  const { t } = useTranslation();

  const blocs = [
    { Icone: Database, fond: "#e0e7ff", encre: "#4338ca", titre: t("methodo_source_titre"), textes: [t("methodo_source_texte")] },
    { Icone: ChartLine, fond: "#dcfce7", encre: "#15803d", titre: t("methodo_modele_titre"), textes: [t("methodo_modele_texte")] },
    { Icone: TriangleAlert, fond: "#fef3c7", encre: "#b45309", titre: t("methodo_limites_titre"), textes: [t("methodo_limites_texte1"), t("methodo_limites_texte2")] },
    { Icone: CalendarClock, fond: "#f3e8ff", encre: "#7e22ce", titre: t("methodo_fraicheur_titre"), textes: [t("methodo_fraicheur_texte")] },
  ];

  return (
    <div className="page-full">
      <BandeauPage
        eyebrow={t("methodo_eyebrow")}
        titre={t("methodo_titre")}
        sous={t("methodo_sous_titre")}
        meta={[
          DATE_MAJ ? `${t("footer_datemaj")} : ${DATE_MAJ} UTC` : null,
          `${t("footer_sources")} : BCEAO · DBnomics`,
        ]}
      />

      <div className="page page--data">
        <div className="methodo-grid">
          {blocs.map((b) => (
            <article key={b.titre} className="methodo-card">
              <div className="feature-icon-box" style={{ background: b.fond, color: b.encre }}>
                <b.Icone />
              </div>
              <h2 className="methodo-card-titre">{b.titre}</h2>
              {b.textes.map((txt, i) => (
                <p key={i}>{txt}</p>
              ))}
            </article>
          ))}
        </div>

        <section className="methodo-signaux">
          <div className="feature-icon-box" style={{ background: "#ffedd5", color: "#c2410c" }}>
            <BellRing />
          </div>
          <div>
            <h2 className="methodo-card-titre">{t("methodo_signaux_titre")}</h2>
            <p>{t("methodo_signaux_intro")}</p>
            <ol>
              <li>{t("methodo_signaux_r1")}</li>
              <li>{t("methodo_signaux_r2")}</li>
              <li>{t("methodo_signaux_r3")}</li>
            </ol>
          </div>
        </section>

        <CalendrierPublications />

        <div className="prevsim-links">
          <Link to="/donnees" className="link-more">{t("prevsim4_lien_donnees")}</Link>
          <Link to="/previsions" className="link-more">{t("compar5_lien_prev")}</Link>
        </div>
      </div>
    </div>
  );
}
