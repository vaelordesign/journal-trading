# Journal de trading — mode d'emploi

Deux façons de l'ouvrir, au choix :

- **En ligne** : <https://vaelordesign.github.io/journal-trading/> — pratique sur le téléphone,
  et tu peux l'ajouter à l'écran d'accueil.
- **En local** : double-clic sur **index.html**, ça s'ouvre dans Chrome.

Dans les deux cas : aucun compte, aucune connexion, aucun serveur qui garde quoi que ce soit.
Tes trades restent dans le navigateur de l'appareil, même en ligne : la page est servie par
GitHub, les données ne lui sont jamais envoyées.

**Attention, une adresse = une base.** Le fichier local et la version en ligne ne partagent
pas leurs données, et le téléphone ne partage pas non plus avec l'ordinateur. Pour passer de
l'un à l'autre : **Exporter** d'un côté, **Importer** de l'autre. Choisis un endroit principal
et tiens-t'y.

---

## 1. Sortir le CSV de TradingView

TradingView n'a **aucune API publique** pour les trades. Le fichier CSV est la seule voie.

1. Ouvre ton graphique sur TradingView.
2. En bas de l'écran, ouvre le **panneau de trading** (celui avec Positions / Orders / Account).
   S'il est fermé, c'est l'onglet **Trading Panel** en bas à gauche.
3. Clique l'onglet **History** (aussi appelé **Order history** selon la version).
4. En haut à droite de ce tableau, il y a une **petite flèche de téléchargement**.
   Clique-la, puis **Export data**.
5. Le fichier arrive dans ton dossier **Téléchargements**, un `.csv`.

## 2. L'importer

1. Dans le journal, onglet **Import**.
2. Glisse le fichier CSV dans le cadre en pointillé (ou clique pour le choisir).
3. Un résumé s'affiche : combien de fills lus, combien de trades vont se former,
   combien de lignes sont ignorées. **Rien n'est enregistré avant que tu cliques
   « Valider l'import ».**
4. Tu peux réimporter le même fichier dix fois : les doublons sont écartés par
   identifiant d'ordre.

Ce que le journal fait avec le CSV : le fichier contient des **ordres** (des fills),
pas des trades. Le journal suit ta position symbole par symbole, calcule le prix moyen
d'entrée, et enregistre un trade chaque fois que ta quantité revient à zéro.
Une entrée en 3 fois et une sortie en 2 fois font **un seul** trade.

Les lignes **Cancelled** et **Rejected** sont ignorées, c'est normal.

Si une position reste ouverte à la fin du fichier, elle apparaît à part, en bas du
tableau de bord : elle n'entre pas dans les statistiques, le profit n'est pas réalisé.

## 3. Les multiplicateurs, à vérifier une fois

Le profit d'un future n'est pas (sortie − entrée) × quantité. Il faut le multiplicateur.
Il est déjà réglé pour MES (5 $ le point), MNQ (2 $), ES, NQ, MGC, MCL et quelques autres.
Onglet **Réglages** si tu trades autre chose : tu ajoutes ton symbole et son multiplicateur,
et **tous les trades sont recalculés immédiatement** (tes notes et captures sont conservées).

Tout symbole inconnu est traité à 1 $ le point, ce qui est juste pour les actions.

## 4. Ce que tu remplis à la main

Clic sur une ligne dans **Trades** pour ouvrir le détail. C'est là que le journal sert
vraiment à quelque chose :

- **Les photos du trade.** Trois façons, elles marchent toutes :
  - le bouton bleu **📷 Photos** en haut de la fenêtre, toujours visible. Sur le téléphone il
    propose l'appareil photo ou la galerie, sur l'ordinateur il ouvre l'explorateur de fichiers.
    Tu peux en sélectionner plusieurs d'un coup ;
  - **Ctrl+V** pour coller une capture d'écran directement depuis le presse-papiers ;
  - glisser l'image dans le cadre en bas de la fenêtre.

  Autant de photos que tu veux, avant et après. Clic sur une vignette pour la voir en grand,
  la petite croix l'efface. Les photos sont enregistrées tout de suite, sans attendre
  le bouton Enregistrer.

  Une photo prise au téléphone pèse plusieurs mégaoctets : elle est automatiquement
  redessinée à 2200 pixels de large, ce qui la rend dix fois plus légère sans qu'un
  graphique devienne illisible. Une capture d'écran normale n'est pas touchée du tout.
  Le poids total des photos, et celui que fera ta sauvegarde, sont affichés dans Réglages.

  Si une photo vient d'un iPhone en format **HEIC**, le navigateur ne sait pas l'afficher :
  le journal la refuse avec un message au lieu de la garder sans pouvoir la montrer.
  Dans les réglages de l'iPhone, Appareil photo → Formats → « Le plus compatible » règle ça
  une fois pour toutes.
- **Stop prévu** et **cible prévue** : c'est ce qui permet de calculer ton risque en dollars,
  ton R planifié et ton R obtenu. Sans ça, la colonne R reste vide.
- **Étiquettes** : les étiquettes ICT sont préréglées, tu ajoutes les tiennes.
- **Stratégie** : choisis un playbook et coche les règles que tu as respectées.
- **Note d'exécution de 1 à 5** : c'est une note sur *ta discipline*, pas sur le résultat
  en argent. Un trade gagnant peut mériter 1 étoile.

## 5. La sauvegarde — à lire

Les données vivent dans le navigateur (IndexedDB), pas dans un fichier que tu peux copier.
Concrètement :

- **Exporte régulièrement** avec le bouton **Exporter** en haut à droite. Ça télécharge un
  seul fichier JSON qui contient tout, captures d'écran comprises. C'est ta seule sauvegarde.
  Mets-la ailleurs que sur ce disque.
- Si tu vides les **cookies et données de site** de Chrome, le journal est effacé.
- N'utilise pas la **navigation privée** : rien ne s'enregistre.
- Dans Chrome, les données sont attachées aux fichiers locaux en général : tu peux déplacer
  ou renommer `index.html`, tu retrouves ton journal.
- **Testé dans Chrome et dans Edge**, les deux fonctionnent en double-clic. Je n'ai pas pu
  tester Firefox (pas installé sur cette machine) et certains navigateurs refusent
  IndexedDB aux fichiers locaux : reste sur Chrome. Si un jour l'app affiche
  « IndexedDB est inaccessible », c'est ça, et il faut alors passer par un serveur local.

Le bouton **Importer** relit un fichier JSON exporté. Il **remplace** tout ce qui est
dans le journal, après confirmation.

## 6. Les autres écrans

- **Tableau de bord** : les 4 chiffres, la note globale sur 100 avec ses 6 sous-notes,
  la courbe de capital, le profit par jour, et les alertes de risque.
  La plage de dates s'applique partout et vaut **tout l'historique** par défaut.
- **Calendrier** : une case par jour, verte ou rouge. Le liseré rouge et le ⚠ veulent dire
  qu'une de tes limites de risque a été dépassée ce jour-là. Clic sur un jour pour le détail.
- **Statistiques** : par étiquette, par heure d'entrée, par jour de la semaine, par symbole,
  par note d'exécution. C'est là que tu vois ce que « Plan violé » te coûte.
- **Playbooks** : tes stratégies et leurs règles. Chaque stratégie a ses propres chiffres,
  dont le pourcentage de fois où tu l'as suivie en entier.
- **Respect des règles** : pour chaque règle, ton résultat quand tu la respectes contre ton
  résultat quand tu la violes, et l'écart en dollars par trade. C'est l'écran le plus utile.
- **Journal quotidien** : ton biais écrit *avant* la séance, ton bilan écrit après,
  avec le profit du jour à côté.
- **Carnet** : les notes qui ne sont pas rattachées à un trade (revue de semaine,
  préparation du lendemain, autopsie d'une erreur), avec des gabarits en un clic.
  Ctrl+V colle aussi les images.
- **Comparaison** : deux périodes côte à côte, pour savoir si tu progresses.
- **Backtest** : bouton **+ Trade manuel** dans Trades, type « Backtest ». Ces trades sont
  **exclus** des statistiques réelles, sauf si tu coches « Inclure le backtest » en haut.
  Fais le rejeu de barres dans TradingView (Bar Replay, gratuit) et note les résultats ici.

## 7. Vérifier que le calcul est juste

Le calcul est couvert par 57 vérifications automatiques. Si tu as Node installé, dans ce
dossier :

```bash
node verifier-moteur.cjs
```

Le script ne contient pas sa propre copie de la logique : il découpe le moteur de calcul
directement dans `index.html` et le rejoue. Si le test passe, c'est bien le code de
l'application qui passe. Il affiche aussi le détail du calcul trade par trade.

Sans Node : onglet **Réglages**, en bas, bouton **Lancer le test**. Même chose dans la page.

## 8. Ce que ce journal ne fait pas

Volontairement, parce que c'est payant ou impossible :

- Pas de moteur de backtest avec données historiques intégrées. Les barres historiques
  coûtent cher. TradingView fait déjà le rejeu de barres, gratuitement.
- Pas de rejeu tick par tick avec carnet d'ordres niveau 2. Ces données sont payantes.
- Pas de synchronisation automatique avec un courtier. Chaque courtier demande un contrat.
- Pas de mode mentor à plusieurs utilisateurs.
