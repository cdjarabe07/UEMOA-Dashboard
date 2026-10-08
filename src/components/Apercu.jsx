// Mini-courbe SVG à l'échelle de la série (sans axes) ; tracé interrompu à la rupture.
// points = [{annee, valeur}], label = description pour les lecteurs d'écran.
export default function Apercu({ points, label, rupture = null }) {
  if (points.length < 2) return <span className="apercu apercu--vide" />;
  const W = 104;
  const H = 32;
  const vals = points.map((p) => p.valeur);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const x = (i) => 2 + (i * (W - 6)) / (points.length - 1);
  const y = (v) => H - 3 - ((v - min) / (max - min || 1)) * (H - 6);
  const coupe = (i) => rupture != null && points[i].annee >= rupture && points[i - 1].annee < rupture;
  const d = points.map((p, i) => `${i && !coupe(i) ? "L" : "M"}${x(i).toFixed(1)} ${y(p.valeur).toFixed(1)}`).join(" ");
  const fin = points[points.length - 1];
  return (
    <svg className="apercu" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx={x(points.length - 1)} cy={y(fin.valeur)} r="2.4" fill="currentColor" />
    </svg>
  );
}
