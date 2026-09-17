/* ============================================================
   Test du moteur de calcul du journal de trading.

   Ce script n'a PAS sa propre copie de la logique : il decoupe le bloc
   compris entre "DEBUT MOTEUR" et "FIN MOTEUR" dans index.html et le
   rejoue tel quel. Si le test passe, c'est le code livre qui passe.

   Utilisation :  node verifier-moteur.cjs
   ============================================================ */
const fs = require('fs');
const path = require('path');

const cible = process.argv[2] || path.join(__dirname, 'index.html');
const source = fs.readFileSync(cible, 'utf8');

const MARQUE_DEBUT = '==================== DEBUT MOTEUR';
const MARQUE_FIN = '/* ==================== FIN MOTEUR';
const iDebut = source.indexOf(MARQUE_DEBUT);
const iFin = source.indexOf(MARQUE_FIN);
if (iDebut < 0 || iFin < 0) {
  console.error('Marqueurs DEBUT MOTEUR / FIN MOTEUR introuvables dans ' + cible);
  process.exit(1);
}
// le bloc commence apres la fin du commentaire d'en-tete du moteur
const code = source.slice(source.indexOf('*/', iDebut) + 2, iFin);

const M = new Function(code + `
  return { MULTIPLICATEURS_DEFAUT, racineSymbole, versNombre, versDate, parserCSV,
           lireFillsDepuisCSV, regrouperEnTrades, statsDeTrades, noteGlobale,
           rRealise, rPlanifie, risqueDollars, fmtArgent, multiplicateurDe };
`)();

let echecs = 0, reussites = 0;
function verifier(nom, obtenu, attendu, tolerance) {
  const tol = tolerance === undefined ? 0.005 : tolerance;
  let ok;
  if (typeof attendu === 'number') ok = Math.abs(obtenu - attendu) <= tol;
  else ok = JSON.stringify(obtenu) === JSON.stringify(attendu);
  if (ok) { reussites++; console.log('   OK   ' + nom + '  =  ' + obtenu); }
  else { echecs++; console.log('  ECHEC ' + nom + '  obtenu ' + obtenu + '  attendu ' + attendu); }
}
function titre(t) { console.log('\n' + t); console.log('-'.repeat(t.length)); }

/* ------------------------------------------------------------------
   1. LES DONNEES D'EXEMPLE DU CAHIER DES CHARGES
   Le CSV est volontairement dans l'ordre decroissant, comme celui que
   TradingView telecharge, et melange les deux symboles.
   ------------------------------------------------------------------ */
const CSV_EXEMPLE =
`Symbol,Side,Type,Quantity,Limit price,Stop price,Fill price,Commission,Placing time,Closing time,Order id,Status
CME_MINI:MES1!,Sell,Market,3,,,7694.50,2.25,2026-09-17 10:46:43,2026-09-17 10:46:43,1001,Filled
CME_MINI:MES1!,Buy,Limit,3,7697.25,,7697.25,2.25,2026-09-17 10:39:58,2026-09-17 10:39:58,1002,Filled
CME_MINI:MNQ1!,Sell,Limit,4,29507.50,,29507.50,3,2026-09-16 10:23:52,2026-09-16 10:23:52,1003,Filled
CME_MINI:MNQ1!,Buy,Limit,4,29459.25,,29458.75,3,2026-09-16 10:23:46,2026-09-16 10:23:46,1004,Filled
CME_MINI:MNQ1!,Buy,Limit,2,29480.00,,29480.00,1.50,2026-09-16 09:12:00,2026-09-16 09:12:00,1005,Cancelled
CME_MINI:MES1!,Sell,Stop,1,,7680.00,7680.00,0.75,2026-09-16 11:00:00,2026-09-16 11:00:00,1006,Rejected`;

titre('1. Lecture du CSV d\'exemple');
const lu = M.lireFillsDepuisCSV(CSV_EXEMPLE);
if (lu.erreur) { console.log('  ERREUR DE LECTURE : ' + lu.erreur); process.exit(1); }
verifier('fills retenus', lu.fills.length, 4);
verifier('lignes ecartees (Cancelled + Rejected)', lu.ignores.length, 2);
verifier('symbole normalise CME_MINI:MES1!', lu.fills[0].symbole, 'MES');

titre('2. Regroupement des fills en trades');
const g = M.regrouperEnTrades(lu.fills);
verifier('nombre de trades formes', g.trades.length, 2);
verifier('positions restees ouvertes', g.ouvertes.length, 0);

console.log('\n  Detail du calcul, trade par trade :');
g.trades.forEach((t, i) => {
  const pts = (t.sens === 'long' ? 1 : -1) * (t.prixSortie - t.prixEntree);
  console.log('\n  Trade ' + (i + 1) + '  ' + t.symbole + '  ' + t.sens.toUpperCase() + '  ' + t.qte + ' contrat(s)');
  console.log('    entree  ' + t.prixEntree + '   sortie  ' + t.prixSortie);
  console.log('    points  ' + pts.toFixed(2) + '  x  ' + t.qte + ' contrat(s)  x  ' +
              t.multiplicateur + ' $ le point  =  ' + M.fmtArgent(t.brut));
  console.log('    commissions  ' + M.fmtArgent(-t.commission));
  console.log('    PROFIT NET   ' + M.fmtArgent(t.net));
});

const tMES = g.trades.find(t => t.symbole === 'MES');
const tMNQ = g.trades.find(t => t.symbole === 'MNQ');
console.log('');
verifier('MES : sens', tMES.sens, 'long');
verifier('MES : prix entree', tMES.prixEntree, 7697.25);
verifier('MES : prix sortie', tMES.prixSortie, 7694.50);
verifier('MES : brut = -2,75 pt x 3 x 5 $', tMES.brut, -41.25);
verifier('MES : commissions 2,25 + 2,25', tMES.commission, 4.50);
verifier('MES : net', tMES.net, -45.75);
verifier('MNQ : brut = 48,75 pt x 4 x 2 $', tMNQ.brut, 390);
verifier('MNQ : net', tMNQ.net, 384);

const stats = M.statsDeTrades(g.trades);
console.log('');
verifier('TOTAL REALISE sur les 4 fills fournis', stats.net, 338.25);

console.log('\n  >>> Le cahier des charges annonce -101,75 $ pour "les 8 fills ci-dessus');
console.log('      plus les 4 autres du 16 septembre". Le bloc d\'exemple n\'en contient');
console.log('      que 4 : ils donnent +338,25 $ (verifie ci-dessus a la main, ligne par');
console.log('      ligne). Les fills manquants doivent donc peser -440,00 $.');
console.log('      Importe le vrai CSV : si le total affiche n\'est pas -101,75 $,');
console.log('      relance ce test avec le fichier pour trouver quel trade s\'ecarte.');

/* ------------------------------------------------------------------
   3. CAS QUI CASSENT LES MOTEURS MAL ECRITS
   ------------------------------------------------------------------ */
function fill(id, sym, sens, qte, prix, heure, comm) {
  return { id: String(id), symbole: M.racineSymbole(sym), symboleBrut: sym, sens: sens,
           qte: qte, prix: prix, commission: comm || 0, temps: new Date(heure).getTime(), statut: 'Filled' };
}

titre('3. Entree en plusieurs fois : prix moyen pondere');
// 2 @ 5000 puis 4 @ 5006  ->  moyenne (2x5000 + 4x5006)/6 = 5004
// sortie 6 @ 5010  ->  6 pt x 6 contrats x 5 $ = 180 $
let r = M.regrouperEnTrades([
  fill(1, 'MES', 'Buy', 2, 5000, '2026-09-10T09:30:00'),
  fill(2, 'MES', 'Buy', 4, 5006, '2026-09-10T09:31:00'),
  fill(3, 'MES', 'Sell', 6, 5010, '2026-09-10T09:40:00')
]);
verifier('un seul trade', r.trades.length, 1);
verifier('prix moyen d\'entree', r.trades[0].prixEntree, 5004);
verifier('quantite (pic de position)', r.trades[0].qte, 6);
verifier('profit', r.trades[0].net, 180);

titre('4. Sortie en plusieurs fois');
// entree 4 @ 100, sortie 2 @ 110 puis 2 @ 90 : +10 et -10 sur 2 contrats = 0
r = M.regrouperEnTrades([
  fill(1, 'MES', 'Buy', 4, 100, '2026-09-10T09:30:00'),
  fill(2, 'MES', 'Sell', 2, 110, '2026-09-10T09:35:00'),
  fill(3, 'MES', 'Sell', 2, 90, '2026-09-10T09:36:00')
]);
verifier('un seul trade', r.trades.length, 1);
verifier('prix de sortie moyen', r.trades[0].prixSortie, 100);
verifier('profit nul', r.trades[0].net, 0);
verifier('nombre de fills rattaches', r.trades[0].nbFills, 3);

titre('5. Vente a decouvert');
// short 3 @ 7700, rachat 3 @ 7690 : +10 pt x 3 x 5 $ = 150 $
r = M.regrouperEnTrades([
  fill(1, 'MES', 'Sell', 3, 7700, '2026-09-10T10:00:00', 2.25),
  fill(2, 'MES', 'Buy', 3, 7690, '2026-09-10T10:05:00', 2.25)
]);
verifier('sens detecte', r.trades[0].sens, 'short');
verifier('profit brut', r.trades[0].brut, 150);
verifier('profit net apres commissions', r.trades[0].net, 145.5);

titre('6. Retournement de position dans le meme fill');
// long 2 @ 100, puis vente de 5 : ferme le long (+2x5x5=50) et ouvre un short de 3
r = M.regrouperEnTrades([
  fill(1, 'MES', 'Buy', 2, 100, '2026-09-10T10:00:00', 1.50),
  fill(2, 'MES', 'Sell', 5, 105, '2026-09-10T10:05:00', 3.75),
  fill(3, 'MES', 'Buy', 3, 101, '2026-09-10T10:20:00', 2.25)
]);
verifier('deux trades separes', r.trades.length, 2);
verifier('trade 1 long : brut 5 pt x 2 x 5 $', r.trades[0].brut, 50);
verifier('trade 1 : commission au prorata (1,50 + 3,75 x 2/5)', r.trades[0].commission, 3.00);
verifier('trade 2 sens', r.trades[1].sens, 'short');
verifier('trade 2 : brut 4 pt x 3 x 5 $', r.trades[1].brut, 60);
verifier('trade 2 : commission au prorata (3,75 x 3/5 + 2,25)', r.trades[1].commission, 4.50);
verifier('aucune position ouverte a la fin', r.ouvertes.length, 0);

titre('7. Position encore ouverte a la fin du fichier');
r = M.regrouperEnTrades([
  fill(1, 'MNQ', 'Buy', 4, 29000, '2026-09-10T10:00:00', 3),
  fill(2, 'MNQ', 'Sell', 1, 29050, '2026-09-10T10:10:00', 0.75)
]);
verifier('aucun trade ferme', r.trades.length, 0);
verifier('une position ouverte', r.ouvertes.length, 1);
verifier('quantite restante', r.ouvertes[0].qte, 3);

titre('8. Symboles');
verifier('CME_MINI:MES1!', M.racineSymbole('CME_MINI:MES1!'), 'MES');
verifier('CME_MINI:MNQ1!', M.racineSymbole('CME_MINI:MNQ1!'), 'MNQ');
verifier('MESZ2025 (code de mois)', M.racineSymbole('MESZ2025'), 'MES');
verifier('NASDAQ:AMZN reste entier', M.racineSymbole('NASDAQ:AMZN'), 'AMZN');
verifier('multiplicateur MES', M.multiplicateurDe('MES'), 5);
verifier('multiplicateur MNQ', M.multiplicateurDe('MNQ'), 2);
verifier('multiplicateur d\'une action', M.multiplicateurDe('AAPL'), 1);

titre('9. Une action : 1 $ par point');
r = M.regrouperEnTrades([
  fill(1, 'NASDAQ:AAPL', 'Buy', 100, 180.50, '2026-09-10T10:00:00', 1),
  fill(2, 'NASDAQ:AAPL', 'Sell', 100, 182.00, '2026-09-10T15:00:00', 1)
]);
verifier('profit = 1,50 $ x 100 actions - 2 $', r.trades[0].net, 148);

titre('10. Nombres et dates tordus');
verifier('"1 234,56"', M.versNombre('1 234,56'), 1234.56);
verifier('"$7,697.25"', M.versNombre('$7,697.25'), 7697.25);
verifier('"(41.25)" = negatif', M.versNombre('(41.25)'), -41.25);
verifier('"2.25 USD"', M.versNombre('2.25 USD'), 2.25);
verifier('vide', M.versNombre(''), 0);
verifier('date TradingView lue en heure locale',
  M.versDate('2026-09-17 10:46:43').getHours(), 10);

titre('11. Statistiques');
const tradesTest = [
  { cle: 'a', net: 100, brut: 102, commission: 2, qte: 1, duree: 600, fermeture: new Date('2026-09-01T10:00:00').getTime(), prixEntree: 100, stopPrevu: 98, multiplicateur: 5 },
  { cle: 'b', net: -50, brut: -48, commission: 2, qte: 1, duree: 300, fermeture: new Date('2026-09-02T10:00:00').getTime() },
  { cle: 'c', net: 200, brut: 202, commission: 2, qte: 1, duree: 900, fermeture: new Date('2026-09-02T14:00:00').getTime() },
  { cle: 'd', net: -25, brut: -23, commission: 2, qte: 1, duree: 120, fermeture: new Date('2026-09-03T10:00:00').getTime() }
];
const st = M.statsDeTrades(tradesTest);
verifier('profit net total', st.net, 225);
verifier('taux de reussite', st.tauxReussite, 0.5);
verifier('facteur de profit (300 / 75)', st.facteurProfit, 4);
verifier('profit moyen par trade', st.moyenne, 56.25);
verifier('nombre de journees', st.nbJours, 3);
verifier('profit du 2 septembre', st.jours['2026-09-02'].net, 150);
verifier('recul maximal (drawdown)', st.ddMax, 50);
verifier('R obtenu du trade a (risque 2 pt x 1 x 5 $ = 10 $)', M.rRealise(tradesTest[0]), 10);

console.log('\n' + '='.repeat(58));
console.log(reussites + ' verifications reussies, ' + echecs + ' echec(s).');
console.log('='.repeat(58));
process.exit(echecs ? 1 : 0);
