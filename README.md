# Dashboard UEMOA (React + Recharts)

## Lancer en local
1. npm install
2. npm run dev
3. Ouvrir http://localhost:5173

## Brancher tes vraies données
Remplace le contenu de `src/data/indicateurs.js` (tableaux `historique` et
`prevision`) par tes vraies valeurs, exportées depuis tes CSV Python (voir
le commentaire en haut du fichier pour le script d'export).

## Déployer sur Vercel
1. Pousse ce dossier dans un repo GitHub (séparé ou dans un sous-dossier du repo existant)
2. Va sur vercel.com, "New Project", importe le repo
3. Vercel détecte Vite automatiquement — clique "Deploy"
