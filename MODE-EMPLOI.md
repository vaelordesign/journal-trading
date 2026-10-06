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

## 1. Sortir le CSV de ton courtier

Aucun courtier ne donne d'API gratuite pour ses trades. Le fichier CSV est la seule voie,
et le journal lit **les deux formats que tu utilises** sans rien avoir à régler.

### Tradovate, c'est ce que tu utilises depuis le 23 septembre 2026

Dans la plateforme, exporte la grille des **ordres exécutés** (Orders, filtrée sur Filled) avec
l'icône de téléchargement de la grille. Tu connais le chemin mieux que moi, tu l'as fait huit
fois dans la journée du 24. Le fichier arrive dans **Téléchargements** et s'appelle
`tradovate-orders-filled-2026-09-24T17_45_01.900Z_db170.csv`.

Trois choses à savoir sur ces fichiers :

- **Ils sont cumulatifs.** Chaque export reprend toute la journée depuis le début. Mesuré :
  l'export de 17 h 23 contenait 28 ordres, celui de 17 h 45 en contenait 30, dont 28 déjà vus.
  Tu peux donc n'importer que le dernier de la journée, ou tous : les doublons sont écartés par
  identifiant d'ordre.
- **Prends toujours `orders-filled`**, pas `notifications-log`, ni `positions`, ni `account-info`.
- **Il n'y a pas de colonne commission.** Le journal met donc 0 $ de frais sur ces trades, et le
  profit affiché est **brut**. C'est la seule inexactitude connue du journal aujourd'hui. Dis-moi
  ce que Tradovate te prend par contrat aller-retour et je l'applique automatiquement à l'import.

Le journal reconnaît les symboles Tradovate au passage : `MNQZ6` devient MNQ, `MESZ6` devient MES,
avec le bon multiplicateur.

### TradingView, pour tes anciens fichiers

1. Ouvre ton graphique sur TradingView.
2. En bas de l'écran, ouvre le **panneau de trading** (celui avec Positions / Orders / Account).
   S'il est fermé, c'est l'onglet **Trading Panel** en bas à gauche.
3. Clique l'onglet **History** (aussi appelé **Order history** selon la version).
4. En haut à droite de ce tableau, il y a une **petite flèche de téléchargement**.
   Clique-la, puis **Export data**.
5. Le fichier arrive dans ton dossier **Téléchargements**, un `.csv`.

Ces fichiers-là, eux, portent la commission : c'est de là que viennent les 81 $ de frais que
le journal connaît. Les deux sources cohabitent sans problème dans le même journal.

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
- **Ton résultat en R, à la main** : +3 si ta cible d'un 1:3 est touchée, -1 si stop, 0 si BE,
  1,5 si tu sors avant. La virgule ou le point marchent, « 2R » aussi. Les boutons **-1** et **0**
  le remplissent d'un clic. Le plus rapide : dans le **Journal quotidien**, carte Discipline du
  jour, chaque trade a sa case R à côté de ses boutons D à A+, et elle s'enregistre toute seule.
  Le journal additionne ensuite tes R partout : carte **Tes résultats en R** du Tableau de bord
  (total, R moyen, gagnant moyen contre perdant moyen, courbe et total par mois), colonne R des
  Trades, R du jour dans le Calendrier et le Journal quotidien, colonne R moyen des
  Statistiques, et Comparaison. « 1:3 » est refusé : on écrit ce que le trade a donné.
  Le **total R du mois** est en haut du Tableau de bord (avec celui du mois d'avant), dans
  l'en-tête du Calendrier et dans « Mois en chiffres » (avec le R de chaque semaine), à côté du
  résultat du jour dans le Journal quotidien, et dans le calendrier de ton profil public.
- **Stop prévu** et **cible prévue** : c'est ce qui permet de calculer ton risque en dollars,
  ton R planifié et ton R obtenu. Si tu as écrit ton R à la main, c'est lui qui compte.
- **Étiquettes** : les étiquettes ICT sont préréglées, tu ajoutes les tiennes.
- **Stratégie** : choisis un playbook et coche les règles que tu as respectées.
- **Note d'exécution de 1 à 5** : c'est une note sur *ta discipline*, pas sur le résultat
  en argent. Un trade gagnant peut mériter 1 étoile.

## 4 bis. Les photos de la journée

Les photos qui ne sont pas liées à un trade précis vont dans l'onglet **Journal quotidien**,
carte **Photos de la journée**, sous le biais et le bilan. C'est l'endroit pour le graphique
du matin, tes niveaux tracés, une photo de ton plan sur papier.

Mêmes trois façons de les mettre : le bouton **📷 Ajouter des photos**, **Ctrl+V** n'importe où
sur la page (même pendant que tu écris ton bilan, le texte n'est pas touché), ou glisser
l'image dans le cadre.

Elles suivent la date affichée en haut de la page : change de jour, tu changes de pile de
photos. On les retrouve aussi en cliquant un jour dans le **Calendrier**, et la liste
« Journées déjà écrites » affiche 📷 avec leur nombre.

Les photos d'un trade précis restent dans le détail du trade. Les deux sont sauvegardées
ensemble dans le fichier JSON.

## 4 bis-bis. Deux adresses : ton profil et ton journal

Depuis le 23 septembre, l'adresse du site est coupée en deux :

| Adresse | Ce que c'est |
|---|---|
| <https://vaelordesign.github.io/journal-trading/> | **Ton profil public.** Tes résultats en lecture seule, à jour. C'est l'adresse que tu donnes aux autres. |
| <https://vaelordesign.github.io/journal-trading/#bord> | **Ton journal de travail.** L'application complète. C'est celle-là qu'il faut mettre en favori et sur l'écran d'accueil du téléphone. |

Le profil se règle dans **Réglages → Profil public** : le titre, la période publiée, et ce que
les gens ont le droit de voir (mêmes cases que le partage). Coche **« Publier tout seul après
chaque import »** et ton profil suivra tes trades sans que tu y penses. Sinon, bouton
**Publier maintenant**.

Tant que tu n'as rien publié, l'adresse de base ouvre ton journal comme avant.

La **clé de publication** est ce qui empêche quelqu'un d'autre d'écraser ton profil. Elle est
fabriquée toute seule la première fois, elle vit dans ton navigateur et dans ta sauvegarde JSON.
Elle ne part jamais en clair : le serveur n'en garde qu'une empreinte.

Où vivent ces données : sur ton projet Supabase `vaelor-sites`, table `journal_profils`, une
seule ligne. Seul ce que tu as coché y monte. **Tes photos, elles, ne quittent jamais ton
appareil.** Une tâche quotidienne dans le dépôt empêche le projet gratuit de s'endormir.

## 4 ter. Montrer tes résultats à quelqu'un

Si tu envoies simplement l'adresse du journal à quelqu'un, il verra un journal **vide** :
tes données sont dans ton navigateur, pas sur le serveur.

Pour lui montrer tes résultats, bouton **🔗 Partager** en haut à droite. Tu choisis la période
et ce que la personne a le droit de voir, puis tu copies le lien.

Ce que le lien contient par défaut : tes chiffres, ta courbe de capital, ton profit par jour,
tes étiquettes et la liste des trades. Ce qu'il **ne contient pas** sauf si tu coches la case :
ce que tu as écrit dans chaque trade, et ton journal quotidien. Tes photos ne partent jamais.

Tu peux aussi cocher **« Cacher les montants en dollars »** : tout est alors converti en
pourcentage de ton compte, et la taille de ton compte n'est pas dans le lien.

Comment ça marche, et ses deux limites :

- Le lien **transporte lui-même** les données, compressées, dans la partie après le `#`.
  Cette partie n'est jamais envoyée au serveur, rien n'est publié sur GitHub, et la personne
  qui ouvre le lien ne touche ni ne voit son propre journal.
- **Qui a le lien a les données.** Il n'y a pas de mot de passe. Envoie-le à qui tu veux,
  mais traite-le comme une capture d'écran de ton compte.
- C'est une **photo figée**. Le rapport ne bougera plus, même quand tu traderas demain.
  Pour montrer la suite, tu regénères un lien.

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

- **Tableau de bord** : les 4 chiffres, la note sur 100, la courbe de capital, le profit par jour,
  tes résultats en R et les alertes de risque.
  La **note sur 100** est la moyenne de deux notes :
  - **Ta stratégie** : espérance par trade, facteur de profit et marge de réussite (ton taux de
    réussite contre celui qui suffit avec ton gain moyen et ta perte moyenne). Elle est mesurée
    **sans les journées hors limites** (perte max du jour ou nombre de trades max de Réglages
    dépassé) : ces trades-là ne sont pas ta stratégie, c'est la discipline qui les paie. Elle se
    mesure en R dès que 10 de ces trades ont un R écrit. Sous 20 trades, elle est ramenée vers 50
    en proportion, parce que quelques trades ne prouvent pas encore une stratégie.
  - **Ta discipline** : journées dans tes limites, régularité des journées, recul du capital
    contre tes gains, et le respect des playbooks et des stops quand tu les remplis.
  Repères des seuils, pris chez TradeZella : facteur de profit 1,3 solide, 1,5 fort,
  2 exceptionnel ; 0,2 R par trade rentable, 0,5 R fort.
  La plage de dates s'applique partout et vaut **tout l'historique** par défaut.
- **Calendrier** : une case par jour, verte ou rouge. Le liseré rouge et le ⚠ veulent dire
  qu'une de tes limites de risque a été dépassée ce jour-là. Clic sur un jour pour le détail.
- **Statistiques** : par étiquette, par heure d'entrée, par jour de la semaine, par symbole,
  par note d'exécution, par qualité du setup, la répartition des profits, et en bas long contre
  short, par durée du trade, par taille de position. C'est là que tu vois ce que « Plan violé »
  te coûte.
- **Tes journées** (juste à côté de Statistiques dans le menu) : comment se déroule une journée.
  Ton **premier trade** (gagnant, BE ou perdant) et ce que tu fais ensuite : combien de fois tu
  t'arrêtes là, ce que la suite te rapporte ou te coûte. Tes **règles d'arrêt rejouées** sur ton
  historique (1, 2 ou 3 trades max, arrêt au premier gain, à la première perte, à ta perte
  max...) avec la meilleure en évidence. Ton 1er, 2e, 3e trade de la journée. Ce que tu fais
  **après un gain, après une perte**, et à quelle vitesse tu reprends. Le nombre de trades par
  jour. Et ton **sommet de la journée** contre ta clôture : ce que tu rends en continuant.
  Un trade compte comme BE s'il finit entre -10 $ et +10 $ ; le seuil se change en haut de
  l'écran et reste enregistré.
- **Playbooks** : tes stratégies et leurs règles. Chaque stratégie a ses propres chiffres,
  dont le pourcentage de fois où tu l'as suivie en entier.
- **Respect des règles** : pour chaque règle, ton résultat quand tu la respectes contre ton
  résultat quand tu la violes, et l'écart en dollars par trade. C'est l'écran le plus utile.
- **Journal quotidien** : ton biais écrit *avant* la séance, ton bilan écrit après,
  avec le profit du jour à côté. En haut, la carte **Discipline du jour** (voir plus bas).
  Tout s'y enregistre tout seul, le texte aussi : changer de date ne perd plus rien.
- **Discipline** : l'analyse de tes notes de discipline (voir la section 6 bis).
- **Carnet** : les notes qui ne sont pas rattachées à un trade (revue de semaine,
  préparation du lendemain, autopsie d'une erreur), avec des gabarits en un clic.
  Ctrl+V colle aussi les images.
- **Comparaison** : deux périodes côte à côte, pour savoir si tu progresses.
- **Backtest** : bouton **+ Trade manuel** dans Trades, type « Backtest ». Ces trades sont
  **exclus** des statistiques réelles, sauf si tu coches « Inclure le backtest » en haut.
  Fais le rejeu de barres dans TradingView (Bar Replay, gratuit) et note les résultats ici.

## 6 bis. La discipline

**Chaque matin**, avant d'ouvrir un trade, dans le Journal quotidien :
1. Note ton état de 1 à 5 : sommeil, énergie, calme.
2. Si tu as écrit une leçon la veille, elle s'affiche comme **objectif du jour**.
3. Écris ton biais (les consignes grises te guident : biais, liquidité visée, niveaux,
   killzone, perte max, scénarios).

**Chaque soir** :
1. Réponds Oui ou Non à chacune de tes **règles du jour**. À moitié respectée = Non.
2. Coche les **erreurs** commises, ou « Aucune erreur aujourd'hui ».
3. Dis si tu as tenu l'objectif du jour.
4. Donne-toi ta **note de discipline de 1 à 10**. Sous la note, l'app te montre ce que
   disent les chiffres (perte max, nombre de trades, stop dépassé, reprise en moins de
   5 minutes après une perte avec la même taille, trades hors de tes heures). Si tu te mets
   8 ou plus alors qu'un de ces points est rouge, elle te le signale : une note honnête
   vaut plus qu'une belle note.
5. Écris **la leçon du jour** : une seule chose que tu changes demain.

L'écran **Discipline** compare ensuite les jours notés 8 à 10 (élevée), 5 à 7 (moyenne) et
1 à 4 (basse) : profit moyen par jour, journées vertes, trades par jour, perte moyenne, pire
journée. Il chiffre aussi ce que te coûte chaque erreur, ce que te rapporte chaque règle,
l'effet de ton sommeil et de ton calme, et ta « fuite de discipline » : la courbe de capital
avec et sans tes jours indisciplinés. En bas, les journées tradées que tu n'as pas encore
notées : un clic pour les noter.

Les listes de règles et d'erreurs se modifient dans **Réglages**, carte Discipline. Tes heures
de trading (par exemple `08:30-11:00, 13:30-16:00`) se règlent dans la carte Compte et risque.

**Qualité du setup** : dans la carte Discipline du jour, chaque trade de la journée a ses
boutons D, C, B, A, A+ (ils sont aussi dans le détail du trade). Note selon ce que tu voyais
*avant* d'entrer. Statistiques et Discipline te montrent alors ce qu'aurait donné ton compte
avec tes seuls A+ et A.

## 7. Vérifier que le calcul est juste

Le calcul est couvert par 236 vérifications automatiques. Si tu as Node installé, dans ce
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
