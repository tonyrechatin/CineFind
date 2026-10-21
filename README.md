# CineFind — prototype débutant

CineFind est un prototype web en HTML, CSS et JavaScript. Il fonctionne sans installation et sans clé API.

## Lancer sur ton PC
1. Décompresse `CineFind.zip`.
2. Ouvre le dossier `CineFind` dans VS Code.
3. Double-clique sur `index.html` dans l'explorateur de fichiers, ou ouvre-le dans ton navigateur.
4. Essaie le bouton « Remplir un exemple de réplique ».

## Ce que cette version fait
- Recherche une réplique parmi six exemples intégrés.
- Permet de choisir une image et de la prévisualiser localement.
- Recherche des films de démonstration à partir d'une description tapée manuellement.
- Présente une interface responsive sombre.

## Limites importantes
Ce n'est pas encore un moteur de reconnaissance complet :
- la base de répliques est minuscule et seulement illustrative ;
- l'image n'est pas analysée automatiquement : l'utilisateur décrit la scène ;
- les résultats ne couvrent pas tous les films.

## Prochaines étapes pour une version complète
1. Ajouter une source de données de dialogues autorisée et suffisamment large.
2. Intégrer une API de métadonnées de films (par exemple TMDB, avec clé API et respect de ses conditions).
3. Ajouter une API de vision pour analyser les images, en tenant compte du coût, des conditions d'utilisation et de la confidentialité.
4. Ajouter un backend pour protéger les clés API — ne jamais mettre une clé secrète directement dans le JavaScript public.
5. Prévoir la politique de confidentialité et les mentions légales avant une mise en ligne publique.

## Publication gratuite
Tu peux publier les fichiers statiques sur GitHub Pages. Ce prototype ne nécessite pas de serveur.
