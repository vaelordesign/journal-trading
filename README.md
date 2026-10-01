# Journal de trading

Journal de trading complet, local et gratuit, qui remplace TradeZella.
Un seul fichier `index.html` : aucun compte, aucune connexion, aucun serveur,
aucune donnée qui sort du navigateur.

**→ [Ouvrir le journal](https://vaelordesign.github.io/journal-trading/)**

## Ce qu'il fait

- **Import** du CSV des ordres exécutés, **Tradovate** (`orders-filled`) ou **TradingView**
  (`History`), avec regroupement des ordres en trades
  (position suivie symbole par symbole, prix moyen pondéré, sorties partielles,
  retournements de position, multiplicateurs des contrats à terme).
- **Tableau de bord** : profit net, taux de réussite, facteur de profit, profit moyen,
  note globale sur 100 détaillée en 6 sous-notes, courbe de capital, profit par jour.
- **Calendrier** mensuel, vert ou rouge, avec les journées hors limites de risque.
- **Détail d'un trade** : captures d'écran collées au Ctrl+V, stop et cible prévus,
  R planifié et R obtenu, étiquettes ICT, note d'exécution, notes libres.
- **Statistiques par étiquette**, par heure, par jour de semaine, par symbole.
- **Playbooks** : des règles cochables par trade, et un écran qui chiffre ce que
  coûte chaque règle violée.
- **Discipline** : chaque jour, une note de 1 à 10, l'état avant la séance (sommeil, énergie,
  calme), des règles du jour à cocher par oui ou non, les erreurs commises et une leçon qui
  devient l'objectif du lendemain. L'écran Discipline compare les jours disciplinés aux autres,
  chiffre chaque erreur et chaque règle, confronte la note aux faits tirés des trades
  (perte max, nombre de trades, stop dépassé, reprise précipitée après une perte, heures),
  et montre la courbe de capital sans les jours indisciplinés.
- **Qualité du setup** (A+, A, B, C) sur chaque trade, et ce qu'aurait donné le compte avec
  les seuls A+ et A.
- **Journal quotidien**, **carnet libre** avec gabarits, **comparaison de périodes**,
  **journal de backtest** séparé des trades réels.
- **Export / import JSON** complet, captures comprises. C'est la seule sauvegarde.

## Où sont les données

Dans IndexedDB, c'est-à-dire dans le navigateur, sur l'appareil. Rien n'est envoyé nulle part.
Chaque adresse a sa propre base : le fichier ouvert en local et la version en ligne ne
partagent pas leurs données. Pour passer de l'une à l'autre, exporter puis importer.

## Vérifier le calcul

```bash
node verifier-moteur.cjs
```

107 vérifications. Le script ne contient pas de copie de la logique : il découpe le bloc
compris entre `DEBUT MOTEUR` et `FIN MOTEUR` dans `index.html` et le rejoue, donc il teste
bien le code livré. Le même test est accessible dans la page, onglet Réglages.

Le mode d'emploi, avec les étapes pour sortir le CSV de Tradovate ou de TradingView, est dans
[MODE-EMPLOI.md](MODE-EMPLOI.md).
