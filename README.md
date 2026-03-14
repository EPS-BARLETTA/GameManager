# PouleManager – web app mobile-first de gestion de tournois

PouleManager est une application statique HTML/CSS/JS pensée pour les encadrants qui veulent configurer, planifier et piloter un tournoi en poule unique directement depuis un smartphone ou une tablette. Tout fonctionne en local : aucune inscription ni backend n’est nécessaire.

## Lancer l’application
1. Copier le dossier `PouleManager` en local.
2. Démarrer un mini-serveur statique pour éviter les restrictions CORS des modules ES, par exemple :
   ```bash
   cd PouleManager
   python3 -m http.server 4173
   ```
3. Ouvrir [http://localhost:4173/index.html](http://localhost:4173/index.html) dans Chrome, Safari ou Edge (desktop ou mobile).
4. Ajouter la page à l’écran d’accueil pour une expérience plein écran si besoin.

## Parcours utilisateur
1. **Landing** – présente l’outil, les principaux bénéfices et propose les actions *Commencer* / *Reprendre*.
2. **Type** – sélection du format (poule unique, groupes, groupes + finales).
3. **Nombre** – réglage tactile du nombre d’équipes (slider + boutons ±).
4. **Noms** – champs confortables, bouton de remplissage automatique et zone « coller une liste » pour appliquer des noms en masse.
5. **Options** – terrains/tables, durée moyenne, heure de début, activation du chrono, son et vibration.
6. **Résultats** – résumé du tournoi, actions principales (Modifier, Régénérer, Imprimer, Live) et secondaires (Retour, Réinitialiser), navigation entre vues *Rotations*, *Par équipe* et *Classement*.
7. **Mode live premium** – header géant (rotation, chrono, statut), saisie tactile des scores, classement live et commandes (pause/reprise chrono, rotation suivante, mode écran) sur une seule page.
8. **Mode chrono plein écran** – écran dédié au chronomètre avec affichage XXL, récap des matchs en cours/terrains, commandes Start/Pause/Reset/Rotation suivante et bouton retour live pour un affichage TV ou projecteur.
9. **Chronomètre flottant** – disponible sur toutes les vues si activé, avec boutons Start/Pause/Reset/Rotation suivante et raccourci « Voir le classement ».

## Fonctionnalités principales
- Trois formats prêts à l’emploi : poule unique, groupes avec classement indépendant, groupes + phase finale automatique (demi-finales, petite finale, finale).
- Génération round-robin fiable (méthode du cercle) pour 2 à 32 équipes avec gestion automatique des exempts et répartition équilibrée dans les groupes (écart max 1 équipe).
- Saisie rapide des scores (inputs tactiles) et mise à jour instantanée du classement (3/1/0 pts, goal average, statut « rotation complète ») par rotation et par groupe.
- Répartition automatique des matchs par terrain + affichage des « slots » supplémentaires lorsque les rencontres dépassent le nombre de terrains.
- Planning horaire estimé à partir de l’heure de début et de la durée moyenne, avec calcul de la fin théorique.
- Mode live premium : header très lisible, chronomètre synchronisé, boutons +/− pour chaque équipe, verrouillage de la rotation suivante tant que tous les scores ne sont pas saisis, surbrillance du groupe actif, aperçu de la rotation suivante et bascule « mode écran » pour l’affichage TV.
- Clôture premium : bouton *Terminer le tournoi* ouvrant un écran dédié (sans stepper) avec classement final et export CSV en un clic.
- Chronomètre sport & plein écran : panneau live + widget flottant + mode plein écran synchronisés (start/pause/reset/rotation suivante), feedback son + vibration optionnels, compteur XXL lisible à distance et note sur les équipes au repos.
- Impression dédiée : seules les sections utiles (résumé, rotations, équipes, classement) apparaissent sur papier/PDF, sans boutons ni widgets flottants.
- Persistance locale complète (`localStorage`) : configuration, scores et progression live peuvent être repris via le bouton « Reprendre ».

## Vues détaillées
- **Rotations** : cartes par rotation avec horaire, durées, badges « Repos », label de groupe/phase, scores et répartition terrain par terrain.
- **Par équipe** : pour chaque équipe, liste compacte des matchs (adversaire, rotation, terrain, horaire, phase) avec mise en forme spécifique pour les repos et prise en compte automatique des phases finales dès que les qualifiés sont connus.
- **Classement** : en poule unique, carte par rotation. En mode groupes, un tableau par groupe + une carte « Phase finale » synthétisant demi-finales/petite finale/finale.
- **Mode live premium** : 4 zones (header Live, matchs/tuiles score, classement live, commandes). Scoreboard tactile avec boutons +/−, mise en évidence des matchs “EN COURS”, badges “VALIDÉ”, aperçu automatique de la prochaine rotation (et de son groupe), indication des repos, chrono synchronisé (start/pause/reset + rotation suivante), bouton Terminer, mode écran géant et tableau live Pos/Équipe/Pts/Diff/J.
- **Mode chrono plein écran** : branding discret, affichage géant de la rotation et du chrono, liste des matchs en cours avec terrains, notes repos, boutons Start/Pause/Reset/Rotation suivante et retour vers le live tout en conservant l’état du timer.
- **Modalité classement final** : sur *Terminer*, une fenêtre plein écran affiche le tableau final (points, matchs joués, G/N/P, BP/BC, diff) et propose un export CSV + retour rapide vers le planning.
- **Widget chrono compact** : toujours accessible via l’icône flottante, boutons tactiles XL, état « running » coloré, message de fin et raccourci vers le classement.
- **Planification horaire double** : calcul automatique du temps “match pur” et d’une estimation complète (matchs + transitions + pause), vérification de faisabilité par rapport à un créneau disponible ou une heure de fin.

## Logique de génération
1. **Préparation** : collecte/normalisation des noms, ajout d’un slot « Exempt » si effectif impair.
2. **Répartition en groupes** : calcul automatique du nombre de groupes (écart max 1 équipe, priorité aux groupes de 4) avec étiquettes A, B, C, D.
3. **Méthode du cercle** : pivot fixe + rotation des autres équipes pour chaque groupe afin de garantir l’unicité des affrontements.
4. **Filtrage des exempts** : les matchs contenant l’exempt sont retirés et affichés comme repos.
5. **Répartition terrains/slots** : distribution modulo du terrain + incrément d’un « slot » lorsque plusieurs vagues sont nécessaires.
6. **Horaires** : si une heure de début est fournie, chaque rotation reçoit une heure de début/fin et la durée totale est estimée.
7. **Phase finale** : en mode « Groupes + finales », génération des demi-finales (selon les règles 2/3/4 groupes), d’un match pour la 3e place et de la finale ; les participants sont résolus dynamiquement (gagnants de groupe, meilleur 2e, vainqueurs/perdants des demis).
8. **Scores & classement** : chaque match possède un identifiant stable ; les classements utilisent la règle 3/1/0 + goal average, puis buts marqués et ordre alphabétique. Les classements par groupe et la carte « phase finale » se mettent à jour dès qu’un score est validé.
9. **Live mode** : `liveRotationIndex` mémorise la rotation affichée. Le bouton « Rotation suivante/Terminer » n’est actif que lorsque tous les scores de la rotation courante sont renseignés.

## Planification du temps
- **Paramètres** : durée d’un match, nombre de terrains, heure de début, temps de rotation, pause additionnelle, durée disponible (minutes) ou heure de fin souhaitée.
- **Calculs affichés** : nombre total de matchs, temps des matchs uniquement, estimation complète (matchs + transitions + pause), heure de fin simulée et indicateur de faisabilité (marge positive ou dépassement).
- **Indicateur** : si un créneau est fourni, un message précise « Le tournoi rentre dans le créneau » ou « dépasse le créneau d’environ XX min ». Toutes les informations sont reprises dans le résumé, le live et le mode impression.

## Impression
Le mode impression masque la landing, le stepper, les actions et le chrono pour ne conserver que :
- le résumé du tournoi,
- la vue sélectionnée (Rotations, Par équipe ou Classement),
- des cartes contrastées adaptées à une impression noir & blanc.

## Pistes V2
1. Permettre de choisir explicitement le nombre de groupes, d’ajouter des phases finales personnalisées (tableaux complets, consolantes) et d’exporter le bracket (CSV/ICS).
2. Gérer des terrains avancés (plages horaires, indisponibilités, multi-sites) et proposer des pauses automatiques.
3. Offrir une synchronisation cloud / partage en temps réel avec notifications (SMS, e-mail, push).
