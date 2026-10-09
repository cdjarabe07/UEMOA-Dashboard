// Population et conditions de vie d'un pays (Banque mondiale) : dernière valeur
// avec son année, valeur de 2010 pour comparaison, et tendance depuis 2000.
import { useTranslation } from "react-i18next";
import { INDICATEURS_BM, serieBM, BM } from "../data/banque_mondiale.js";
import { fmtDate, fmtNombre } from "../lib/format.js";
import Apercu from "./Apercu.jsx";

const fmt = (id, v) => {
  if (v == null) return "—";
  if (id === "population") return `${fmtNombre(v / 1e6, 1, true)} M`;
  if (id === "pib_habitant_usd" || id === "mortalite_moins_5_ans") return fmtNombre(v, 0);
  return fmtNombre(v, 1, true);
};

/** groupe : « conditions » (population, conditions de vie) ou « financement » (financement extérieur). */
export default function ConditionsDeVie({ zone, groupe = "conditions" }) {
  const { t } = useTranslation();
  const indicateurs = INDICATEURS_BM.filter((i) => (i.groupe || "conditions") === groupe);
  return (
    <>
      <div className="defilant">
        <table className="tableau tableau-bm tableau-cdv">
          <thead>
            <tr>
              <th scope="col">{t("col_indicateur")}</th>
              <th scope="col" className="num">{t("bm_col_2010")}</th>
              <th scope="col" className="num">{t("bm_col_derniere")}</th>
              <th scope="col">{t("bm_col_tendance")}</th>
            </tr>
          </thead>
          <tbody>
            {indicateurs.map((i) => {
              const s = serieBM(i.id, zone);
              const der = s.at(-1);
              const ref = s.find((p) => p.annee === 2010);
              const ancien = der && der.annee < 2018;
              return (
                <tr key={i.id}>
                  <th scope="row">
                    {t(`bm_${i.id}`)}
                    <small>{t(`bm_unite_${i.id}`)}</small>
                  </th>
                  <td className="num nombre">{ref ? fmt(i.id, ref.valeur) : "—"}</td>
                  <td className="num nombre">
                    {der ? <><b>{fmt(i.id, der.valeur)}</b> <small className={ancien ? "bm-ancien" : undefined}>({der.annee})</small></> : "—"}
                  </td>
                  <td>
                    {s.length > 1 ? <Apercu points={s} label={t("bm_tendance_aria", { indicateur: t(`bm_${i.id}`) })} /> : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="note">{t("bm_source", { maj: BM.mise_a_jour_source ? fmtDate(new Date(`${BM.mise_a_jour_source}T00:00:00Z`)) : "—" })}</p>
    </>
  );
}
