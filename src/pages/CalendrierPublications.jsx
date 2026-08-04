const DATES_PUBLICATIONS = [
  { source: "BCEAO", frequence: "Trimestrielle", periode: "PIB, comptes nationaux" },
  { source: "BCEAO", frequence: "Mensuelle", periode: "Inflation (IPC), taux de change" },
  { source: "ANSD", frequence: "Mensuelle", periode: "IHPC détaillé (Sénégal)" },
  { source: "FMI", frequence: "Semestrielle", periode: "Perspectives économiques (WEO)" },
];

export default function CalendrierPublications() {
  return (
    <div className="calendrier-publications">
      <h2 className="section-title">Calendrier des publications officielles</h2>
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Fréquence</th>
            <th>Indicateurs concernés</th>
          </tr>
        </thead>
        <tbody>
          {DATES_PUBLICATIONS.map((d, i) => (
            <tr key={i}>
              <td>{d.source}</td>
              <td>{d.frequence}</td>
              <td>{d.periode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}