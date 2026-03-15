# PouleManager – V2 EPS terrain

PouleManager est une application web statique (HTML/CSS/JS) pensée pour les professeurs d’EPS qui veulent créer, planifier et piloter un tournoi directement sur le terrain (téléphone, tablette, TV). Tout fonctionne hors-ligne : il suffit d’ouvrir `index.html` via un petit serveur local.

## Lancer l’application
1. Copier le dossier `PouleManager` sur votre machine.
2. Depuis ce dossier, lancer un serveur statique basique :
   ```bash
   python3 -m http.server 4173
   ```
3. Ouvrir [http://localhost:4173/index.html](http://localhost:4173/index.html) dans Chrome, Edge ou Safari (desktop/mobile).
4. Optionnel : ajouter la page à l’écran d’accueil pour un affichage plein écran.

## Parcours utilisateur
1. **Landing simplifiée** – trois actions visibles : *Créer un tournoi*, *Reprendre* (recharge le dernier état `localStorage`), *Mode EPS rapide*.
2. **Mode EPS rapide** – un écran unique pour saisir participants, terrains, durée, heure de début, type d’activité et (optionnellement) activer Arbitre / Table. Le bouton « Générer rapidement » crée un planning complet, tout en conservant l’accès aux options avancées (où le rôle Coach reste disponible).
3. **Étape 1 – Format** – poule unique, groupes ou groupes + finales.
4. **Étape 2 – Nombre** – compteur + slider neutres (« Nombre d’équipes / participants »).
5. **Étape 3 – Noms** – champs confortables, auto-remplissage, collage de liste (placeholders dynamiques selon sport-co / raquette).
6. **Étape 4 – Options**
   - **Essentiel** : type de pratique (sport-co ou raquette), nombre de terrains, format de match (au temps / score cible), durée du match, heure de début.
   - **Avancé** (replié par défaut) : temps de rotation, pause globale, créneau disponible ou heure de fin, chrono + son/vibration, simulation, configuration recommandée et réglages des rôles EPS.
7. **Étape 5 – Résultats** – résumé pédagogique (volume de jeu, temps de transition, durée réelle, fin prévue, matches par terrain, analyse d’engagement), onglets *Rotations*, *Par …* (équipe/participant) et *Classement*, actions principales (Live, Imprimer, Modifier) et secondaires (Régénérer, Retour, Réinitialiser).

## Vocabulaire dynamique & rôles EPS
- Le vocabulaire bascule automatiquement entre **équipe(s)** et **participant(s)** selon la pratique (sport collectif / raquette). Le terme **terrain** est utilisé partout, même pour les tables de tennis de table.
- Les rôles EPS disponibles sont **Arbitre**, **Table de marque** et **Coach** (optionnel). Arbitre et Table peuvent être activés dès le mode rapide ; Coach reste configurable dans les options avancées. Aucun rôle n’est activé par défaut.
- Les équipes / participants au repos reçoivent automatiquement les rôles cochés. L’ordre de priorité est : Arbitre → Table → Coach. Si le nombre d’équipes au repos est insuffisant, seuls les rôles réellement attribués sont affichés.
- Les rôles apparaissent dans toutes les vues : rotations, grilles terrain, mode live, aperçu de la rotation suivante, mode projection, mode chrono et impression noir & blanc.

## Live, projection et chrono
- **Mode live terrain** : rotation en cours + prochaine rotation, tableau des terrains (« Terrain X : A vs B » + rôles), cartes de scores tactiles (boutons ±, validation), chrono intégré (Start/Pause/Reset/Rotation suivante) et bouton *Terminer le tournoi* disponible à tout moment (confirmation + classement final immédiat, même si des scores manquent).
- **Mode projection** : affichage grand format synchronisé (rotation/chrono, terrains, rôles, prochaine rotation, équipes hors match) avec code couleur (orange « En jeu », bleu « À venir », gris « Attente ») et aucun bouton flottant parasite pour TV/VP.
- **Mode chrono plein écran** : timer XXL, matches de la rotation (terrains + rôles), bloc « Équipes en attente » cohérent et commandes chrono/retour live dans une interface épurée.
- **Widget chrono** flottant toujours disponible si le chrono est activé.

## Planification & impression
- Le résumé et la simulation affichent clairement : volume total de jeu, temps de transition, temps des pauses, durée réelle du tournoi, fin prévue, matches par terrain, matches par équipe/participant, temps moyen d’attente, engagement moteur.
- Chaque vague de matchs (slot) devient une rotation visible : avec 2 terrains, une rotation contient donc 2 matchs maximum, ce qui maintient des équipes réellement « au repos » pour attribuer les rôles EPS.
- La simulation (« Simuler ») et la configuration recommandée proposent une analyse pédagogique et un message de faisabilité (OK ou dépassement avec suggestions).
- L’impression/PDF masque la navigation, garde le résumé et la vue active, applique un thème noir & blanc lisible (cartes non coupées, titres contrastés, rôles et terrains visibles). Idéal pour distribuer la fiche aux arbitres/table de marque.

## Formats pris en charge
- **Poule unique** (round-robin) : 2 à 32 participants avec gestion automatique des exempts.
- **Groupes** : répartition équilibrée (écart max 1) avec mini round-robin par groupe et classements indépendants.
- **Groupes + finales** : phase de groupes puis demi-finales, match 3e place et finale générés automatiquement selon les règles annoncées (2, 3 ou 4 groupes).

## Terminer le tournoi
Le bouton « Terminer le tournoi » est accessible depuis le live. Une confirmation s’affiche ; si l’enseignant confirme, le chrono est mis en pause et le classement final apparaît immédiatement (export CSV prévu). Les scores incomplets restent indiqués comme tels.

## Pistes V3
1. Choix manuel du nombre de groupes, gestion des barrages et consolantes.
2. Support avancé des sports de raquette (multi-sets, formats 21 pts, etc.).
3. Synchronisation multi-écran (planning partagé élèves / parents) et export ICS.
4. Personnalisation poussée des fiches impression (logo établissement, signature arbitre, cases d’observation).
