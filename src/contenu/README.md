# Contenus éditoriaux de l'Observatoire

Trois natures de contenu, à ne jamais mélanger :

| Nature | Ce que c'est | Fichier |
|---|---|---|
| **Analyse** | texte produit par l'Observatoire, validé par une personne | `analyses/<id>.json` (un fichier par analyse) |
| **Dossier thématique** | regroupement de séries réelles autour d'un thème ; existe même sans analyse | `dossiers.js` |
| **Publication** | document réel d'une institution, avec son lien officiel vérifié | `publications.json` |

Aucun contenu fictif : pas d'analyse d'exemple, pas de publication non vérifiée.

## Publier une analyse

Ajouter un fichier `analyses/<id>.json`. Aucune modification de code n'est nécessaire :
le fichier est chargé automatiquement, validé, puis affiché dans la rubrique Analyses,
dans son dossier thématique et sur la page d'accueil.

Une analyse n'est visible en ligne que si `statut` vaut `"publiee"` **et** si
`validation.par` et `validation.le` sont renseignés. Un brouillon (`"brouillon"`)
n'apparaît que dans une construction lancée avec `VITE_APERCU_BROUILLONS=1`,
avec un bandeau « Brouillon ». Un fichier invalide est ignoré et signalé dans la
console du navigateur (mode développement).

```json
{
  "id": "identifiant-en-minuscules",
  "statut": "brouillon",
  "date_publication": "AAAA-MM-JJ",
  "auteurs": ["Prénom Nom"],
  "validation": { "par": "Prénom Nom", "le": "AAAA-MM-JJ" },
  "dossier": "inflation",
  "donnees_au": "AAAA-MM-JJ",
  "titre":    { "fr": "…", "en": "…" },
  "resume":   { "fr": "…", "en": "…" },
  "question": { "fr": "…", "en": "…" },
  "indicateurs": ["inflation"],
  "zones": ["uemoa", "niger"],
  "blocs": [
    { "type": "texte", "titre": { "fr": "Contexte", "en": "Context" }, "contenu": { "fr": ["paragraphe", "…"], "en": ["…"] } },
    { "type": "graphique", "indicateur": "inflation", "zones": ["uemoa", "niger"], "debut": 2015, "fin": 2024,
      "titre": { "fr": "…", "en": "…" } },
    { "type": "tableau", "indicateur": "inflation", "zones": ["uemoa", "niger"], "annees": [2022, 2023, 2024],
      "titre": { "fr": "…", "en": "…" } }
  ],
  "observations": [{ "fr": "…", "en": "…" }],
  "limites": [{ "fr": "…", "en": "…" }],
  "sources": [{ "titre": "…", "url": "https://…" }],
  "publications": ["bceao-rapport-annuel-2023"]
}
```

- Les graphiques et tableaux sont **toujours** tracés à partir de `src/data/portail.json` :
  on ne colle jamais d'image ni de chiffre recopié. Les ruptures de série déclarées
  y sont appliquées automatiquement.
- `donnees_au` : date des données utilisées pour rédiger le texte. Si les données du
  portail sont plus récentes, la page l'indique au lecteur.
- `indicateurs` : identifiants de `portail.json` ; `zones` : `uemoa` et les 8 pays.
- `publications` : identifiants de `publications.json`.

## Ajouter une publication

Une entrée dans `publications.json` : document réel, lien officiel ouvert et vérifié
(`verifie_le`), `couverture` à `null` tant que la licence de l'image n'est pas établie.
