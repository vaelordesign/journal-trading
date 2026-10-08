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
  note sur 100 en deux parties (ta stratégie, mesurée sans les journées hors limites et en R
  quand c'est possible ; ta discipline), courbe de capital, profit par jour.
- **Calendrier** mensuel, vert ou rouge, avec les journées hors limites de risque.
- **Détail d'un trade** : captures d'écran collées au Ctrl+V, stop et cible prévus,
  R planifié et R obtenu, étiquettes ICT, note d'exécution, notes libres.
- **R écrit à la main** sur chaque trade (+3, -1, 0, 1,5), depuis le détail du trade ou le journal du
  jour, et additionné partout : total et R moyen, courbe en R, R par mois, R du jour au calendrier.
- **Tes journées** : le premier trade et ce qui suit (arrêt ou non, ce que rapporte
  la suite), les règles d'arrêt rejouées sur l'historique, le rang du trade dans la journée, le trade
  qui suit un gain ou une perte, le sommet de la journée contre la clôture.
- **Statistiques** : étiquette, heure, jour de semaine, long ou short, durée, taille,
  symbole, note d'exécution, qualité du setup.
- **Playbooks** : des règles cochables par trade, et un écran qui chiffre ce que
  coûte chaque règle violée.
- **Discipline** : chaque jour, une note de 1 à 10, l'état avant la séance (sommeil, énergie,
  calme), des règles du jour à cocher par oui ou non, les erreurs commises et une leçon qui
  devient l'objectif du lendemain. L'écran Discipline compare les jours disciplinés aux autres,
  chiffre chaque erreur et chaque règle, confronte la note aux faits tirés des trades
  (perte max, nombre de trades, stop dépassé, reprise précipitée après une perte, heures),
  et montre la courbe de capital sans les jours indisciplinés.
- **Qualité du setup** de D à A+ sur chaque trade, notée depuis le journal du jour, et ce qu'aurait donné le compte avec
  les seuls A+ et A.
- **Journal quotidien** : préparation du matin en cases séparées (biais, nuit, liquidité, niveaux,
  annonces, invalidation, scénarios A et B, plan de risque), résumé de la journée et justesse du biais.
- **Carnet libre** avec gabarits, **comparaison de périodes**,
  **journal de backtest** séparé des trades réels.
- **Synchronisation entre appareils** (ordinateur et téléphone) par Supabase, protégée par la clé
  de publication : on l'active sur l'ordinateur, on scanne un code QR avec le téléphone.
- **Export / import JSON** complet, captures comprises.

## Où sont les données

Dans IndexedDB, c'est-à-dire dans le navigateur, sur l'appareil. Chaque adresse a sa propre
base. Quand la synchronisation est active, chaque modification part aussi dans la base
Supabase (table `journal_sync`, voir `supabase/sync.sql`), accessible seulement avec la clé
de publication, et les autres appareils la récupèrent. Sans synchronisation, rien n'est envoyé
nulle part : pour passer d'un appareil à l'autre, exporter puis importer.

## Vérifier le calcul

```bash
node verifier-moteur.cjs
```

110 vérifications. Le script ne contient pas de copie de la logique : il découpe le bloc
compris entre `DEBUT MOTEUR` et `FIN MOTEUR` dans `index.html` et le rejoue, donc il teste
bien le code livré. Le même test est accessible dans la page, onglet Réglages.

Le mode d'emploi, avec les étapes pour sortir le CSV de Tradovate ou de TradingView, est dans
[MODE-EMPLOI.md](MODE-EMPLOI.md).
