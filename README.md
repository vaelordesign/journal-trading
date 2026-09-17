# Journal de trading

Journal de trading complet, local et gratuit, qui remplace TradeZella.
Un seul fichier `index.html` : aucun compte, aucune connexion, aucun serveur,
aucune donnée qui sort du navigateur.

**→ [Ouvrir le journal](https://vaelordesign.github.io/journal-trading/)**

## Ce qu'il fait

- **Import** du CSV `History` de TradingView, avec regroupement des ordres en trades
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

57 vérifications. Le script ne contient pas de copie de la logique : il découpe le bloc
compris entre `DEBUT MOTEUR` et `FIN MOTEUR` dans `index.html` et le rejoue, donc il teste
bien le code livré. Le même test est accessible dans la page, onglet Réglages.

Le mode d'emploi, avec les étapes exactes pour sortir le CSV de TradingView, est dans
[MODE-EMPLOI.md](MODE-EMPLOI.md).
