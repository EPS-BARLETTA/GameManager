# PouleManager – web app mobile-first de gestion de tournois

PouleManager est une application statique HTML/CSS/JS pensée pour les encadrants qui veulent configurer, planifier et piloter un tournoi en poule unique directement depuis un smartphone ou une tablette. Tout fonctionne en local : aucune inscription ni backend n’est nécessaire.

## Lancer l’application
1. Copier le dossier `poule-unique` en local.
2. Démarrer un mini-serveur statique pour éviter les restrictions CORS des modules ES, par exemple :
   ```bash
   cd poule-unique
   python3 -m http.server 4173
   ```
3. Ouvrir [http://localhost:4173/index.html](http://localhost:4173/index.html) dans Chrome, Safari ou Edge (desktop ou mobile).
4. Ajouter la page à l’écran d’accueil pour une expérience plein écran si besoin.

## Parcours utilisateur
1. **Landing** – présente l’outil, les principaux bénéfices et propose les actions *Commencer* / *Reprendre*.
2. **Type** – sélection du format (poule unique actif, autres formats annoncés).
3. **Nombre** – réglage tactile du nombre d’équipes (slider + boutons ±).
4. **Noms** – champs confortables, bouton de remplissage automatique et zone « coller une liste » pour appliquer des noms en masse.
5. **Options** – terrains/tables, durée moyenne, heure de début, activation du chrono, son et vibration.
6. **Résultats** – résumé du tournoi, actions principales (Modifier, Régénérer, Imprimer, Live) et secondaires (Retour, Réinitialiser), navigation entre vues *Rotations*, *Par équipe* et *Classement*.
7. **Mode live premium** – header géant (rotation, chrono, statut), saisie tactile des scores, classement live et commandes (pause/reprise chrono, rotation suivante, mode écran) sur une seule page.
8. **Mode chrono plein écran** – écran dédié au chronomètre avec affichage XXL, récap des matchs en cours/terrains, commandes Start/Pause/Reset/Rotation suivante et bouton retour live pour un affichage TV ou projecteur.
9. **Chronomètre flottant** – disponible sur toutes les vues si activé, avec boutons Start/Pause/Reset/Rotation suivante et raccourci « Voir le classement ».

## Fonctionnalités principales
- Génération round-robin fiable (méthode du cercle) pour 2 à 32 équipes avec gestion automatique des exempts.
- Saisie rapide des scores (inputs tactiles) et mise à jour instantanée du classement (3/1/0 pts, goal average, statut « rotation complète »).
- Répartition automatique des matchs par terrain + affichage des « slots » supplémentaires lorsque les rencontres dépassent le nombre de terrains.
- Planning horaire estimé à partir de l’heure de début et de la durée moyenne, avec calcul de la fin théorique.
- Mode live premium : header très lisible, chronomètre synchronisé, boutons +/− pour chaque équipe, verrouillage de la rotation suivante tant que tous les scores ne sont pas saisis, classement live recalculé à la volée et bascule « mode écran » pour l’affichage TV.
- Clôture premium : bouton *Terminer le tournoi* ouvrant un écran dédié (sans stepper) avec classement final et export CSV en un clic.
- Chronomètre sport & plein écran : panneau live + widget flottant + mode plein écran synchronisés (start/pause/reset/rotation suivante), feedback son + vibration optionnels, compteur XXL lisible à distance et note sur les équipes au repos.
- Impression dédiée : seules les sections utiles (résumé, rotations, équipes, classement) apparaissent sur papier/PDF, sans boutons ni widgets flottants.
- Persistance locale complète (`localStorage`) : configuration, scores et progression live peuvent être repris via le bouton « Reprendre ».

## Vues détaillées
- **Rotations** : cartes par rotation avec horaire, durées, badges « Repos », scores, et répartition terrain par terrain.
- **Par équipe** : pour chaque équipe, liste compacte des matchs (adversaire, rotation, terrain, horaire) avec mise en forme spécifique pour les repos.
- **Classement** : un tableau par rotation indiquant points, victoires/nuls/défaites, goal average et statut de complétude.
- **Mode live premium** : 4 zones (header Live, matchs/tuiles score, classement live, commandes). Scoreboard tactile avec boutons +/−, mise en évidence des matchs “EN COURS”, boutons de validation pour chaque terrain, badge “VALIDÉ” verrouillant les scores, aperçu automatique de la prochaine rotation, indication des équipes au repos, chrono synchronisé (start/pause/reset + rotation suivante), bouton Terminer, mode écran géant et tableau live Pos/Équipe/Pts/Diff/J.
- **Mode chrono plein écran** : branding discret, affichage géant de la rotation et du chrono, liste des matchs en cours avec terrains, notes repos, boutons Start/Pause/Reset/Rotation suivante et retour vers le live tout en conservant l’état du timer.
- **Modalité classement final** : sur *Terminer*, une fenêtre plein écran affiche le tableau final (points, matchs joués, G/N/P, BP/BC, diff) et propose un export CSV + retour rapide vers le planning.
- **Widget chrono compact** : toujours accessible via l’icône flottante, boutons tactiles XL, état « running » coloré, message de fin et raccourci vers le classement.

## Logique de génération
1. **Préparation** : collecte/normalisation des noms, ajout d’un slot « Exempt » si effectif impair.
2. **Méthode du cercle** : pivot fixe + rotation des autres équipes pour garantir l’unicité des affrontements.
3. **Filtrage des exempts** : les matchs contenant l’exempt sont retirés et affichés comme repos.
4. **Répartition terrains/slots** : distribution modulo du terrain + incrément d’un « slot » lorsque plusieurs vagues sont nécessaires.
5. **Horaires** : si une heure de début est fournie, chaque rotation reçoit une heure de début/fin et la durée totale est estimée.
6. **Scores & classement** : chaque match possède un identifiant stable `rotation + équipes` pour stocker les scores ; les classements par rotation s’appuient sur ces données (3 pts victoire, 1 pt nul, 0 pt défaite, goal average en tie-break, puis buts marqués et ordre alphabétique).
7. **Live mode** : `liveRotationIndex` mémorise la rotation affichée. Le bouton « Rotation suivante/Terminer » n’est actif que lorsque tous les scores de la rotation courante sont renseignés.

## Impression
Le mode impression masque la landing, le stepper, les actions et le chrono pour ne conserver que :
- le résumé du tournoi,
- la vue sélectionnée (Rotations, Par équipe ou Classement),
- des cartes contrastées adaptées à une impression noir & blanc.

## Pistes V2
1. Ajouter de nouveaux formats (playoffs, multi-poules) et des exports CSV/ICS.
2. Gérer des terrains avancés (plages horaires, indisponibilités, multi-sites) et proposer des pauses automatiques.
3. Offrir une synchronisation cloud / partage en temps réel avec notifications (SMS, e-mail, push).
