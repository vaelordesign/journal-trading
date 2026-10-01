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
           rRealise, rPlanifie, risqueDollars, fmtArgent, multiplicateurDe,
           analyseDiscipline, tradesSuspectsVengeance, faitsDiscipline, niveauDiscipline,
           lirePlagesHoraires, dansPlagesHoraires, tradesApresPerteMax, analyseQualite };
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

titre('12. Discipline : vengeance detectee sur les heures');
const h = s => new Date('2026-09-10T' + s).getTime();
const tv = (cle, ouv, ferm, net, qte) => ({ cle, ouverture: h(ouv), fermeture: h(ferm), net, brut: net, qte, commission: 0 });
const perte1 = tv('p1', '09:50:00', '10:00:00', -100, 2);
const repriseRapide = tv('r1', '10:03:00', '10:10:00', -80, 2);   // 3 min apres une perte, meme taille
const repriseLente = tv('r2', '10:30:00', '10:40:00', 50, 3);      // 20 min apres : pas suspect
const plusPetit = tv('r3', '10:42:00', '10:45:00', 20, 1);         // apres un gain : pas suspect
let susp = M.tradesSuspectsVengeance([perte1, repriseRapide, repriseLente, plusPetit]);
verifier('une seule reprise suspecte', susp.length, 1);
verifier('c\'est bien le trade de 10:03', susp[0].trade.cle, 'r1');
verifier('3 minutes apres la perte', susp[0].minutes, 3);
const perte2 = tv('p2', '11:00:00', '11:05:00', -50, 3);
const reduite = tv('r4', '11:06:00', '11:09:00', 10, 1);            // taille reduite : pas suspect
verifier('taille reduite apres une perte : pas suspect',
  M.tradesSuspectsVengeance([perte2, reduite]).length, 0);

titre('13. Discipline : les faits du jour');
const rgD = { perteJourMax: 150, tradesJourMax: 3, compte: 25000, risqueMaxPct: 1 };
const jourD = { net: -130, nb: 4, trades: [perte1, repriseRapide, repriseLente, plusPetit] };
const faits = M.faitsDiscipline(jourD, rgD);
const fait = cle => faits.filter(f => f.cle === cle)[0];
verifier('perte max respectee (-130 contre -150)', fait('perte').ok, true);
verifier('4 trades pour 3 permis : faute', fait('nombre').ok, false);
verifier('reprise precipitee : faute', fait('vengeance').ok, false);
verifier('sans stop renseigne, pas de ligne stop', fait('stop'), undefined);

titre('14. Discipline : haute contre basse');
const J = (date, note, net, extra) => Object.assign({ date, discipline: note }, extra || {});
const pj = (net, nb) => ({ net, nb, trades: Array.from({ length: nb }, (_, i) => ({
  cle: 'x' + Math.random(), net: net / nb, brut: net / nb, commission: 0, qte: 1,
  ouverture: h('10:00:00') + i * 3600000, fermeture: h('10:30:00') + i * 3600000 })) });
const joursD = [
  J('2026-09-01', 9, 0, { erreurs: [], criteres: { a: true } }),
  J('2026-09-02', 8, 0, { erreurs: [], criteres: { a: true } }),
  J('2026-09-03', 3, 0, { erreurs: ['FOMO'], criteres: { a: false } }),
  J('2026-09-04', 2, 0, { erreurs: ['FOMO', 'Vengeance'], criteres: { a: false } }),
  J('2026-09-05', 6, 0, { erreurs: [], criteres: { a: true } }),
  J('2026-09-06', 10, 0),                                   // notee mais pas tradee
  { date: '2026-09-07', biais: 'rien' }                     // pas notee
];
const parJourD = {
  '2026-09-01': pj(200, 2), '2026-09-02': pj(100, 1), '2026-09-03': pj(-150, 3),
  '2026-09-04': pj(-250, 5), '2026-09-05': pj(50, 1), '2026-09-07': pj(30, 1)
};
const an = M.analyseDiscipline(joursD, parJourD, { reglages: {}, criteres: [{ id: 'a', text: 'Plan suivi' }] });
const niv = cle => an.niveaux.filter(n => n.cle === cle)[0];
verifier('6 journees notees', an.nbNotees, 6);
verifier('5 journees notees ET tradees', an.nbNoteesTradees, 5);
verifier('discipline moyenne (9+8+3+2+6+10)/6', an.moyenne, 38 / 6);
verifier('haute : 2 journees', niv('haute').nbJours, 2);
verifier('haute : +150 $ par jour', niv('haute').moyenneJour, 150);
verifier('basse : -200 $ par jour', niv('basse').moyenneJour, -200);
verifier('basse : 4 trades par jour', niv('basse').tradesParJour, 4);
verifier('moyenne : +50 $', niv('moyenne').moyenneJour, 50);
verifier('pente positive (un point de discipline rapporte)', an.pente > 0, true);
verifier('correlation forte', an.correlation > 0.9, true);
verifier('serie actuelle a 8+ (le 10 du 6 sept.)', an.serieActuelle, 1);
verifier('meilleure serie a 8+', an.meilleureSerie, 2);
const fomo = an.erreurs.filter(e => e.nom === 'FOMO')[0];
verifier('FOMO : 2 journees', fomo.nbJours, 2);
verifier('FOMO : -200 $ par jour avec', fomo.moyenneAvec, -200);
verifier('FOMO : ecart contre les jours sans (-200 - 116,67)', fomo.ecart, -200 - 350 / 3);
verifier('regle "Plan suivi" : respectee 3 fois', an.criteres[0].nbOui, 3);
verifier('regle "Plan suivi" : ecart par jour', an.criteres[0].ecart, 350 / 3 + 200);
verifier('journee tradee sans note a remplir', JSON.stringify(an.sansNote), JSON.stringify(['2026-09-07']));
verifier('et si : total sans les jours bas', an.whatIf.sansBasse, -20 + 400);
verifier('niveau de 7 = moyenne', M.niveauDiscipline(7).cle, 'moyenne');
verifier('niveau de 8 = haute', M.niveauDiscipline(8).cle, 'haute');
verifier('courbe reelle a la fin = total', an.courbes[an.courbes.length - 1].reelle, -20);
verifier('courbe sans les jours bas a la fin', an.courbes[an.courbes.length - 1].sansBasse, 380);

titre('15. Discipline : heures permises et perte max');
const pl = M.lirePlagesHoraires('08:30-11:00, 13h30-15h');
verifier('deux plages lues', pl.length, 2);
verifier('8:30 = 510 minutes', pl[0].debut, 510);
verifier('15h = 900 minutes', pl[1].fin, 900);
verifier('"9-11" sans les minutes', M.lirePlagesHoraires('9-11')[0].fin, 660);
verifier('texte illisible ignore', M.lirePlagesHoraires('le matin').length, 0);
verifier('10:03 est dans les heures', M.dansPlagesHoraires(h('10:03:00'), pl), true);
verifier('12:00 est hors des heures', M.dansPlagesHoraires(h('12:00:00'), pl), false);
verifier('11:00 pile est deja dehors', M.dansPlagesHoraires(h('11:00:00'), pl), false);
// perte1 (-100) puis repriseRapide (-80) : -180 a 10:10, sous la limite de 150
verifier('trades ouverts apres la perte max', M.tradesApresPerteMax([perte1, repriseRapide, repriseLente, plusPetit], 150)
  .map(t => t.cle).join(','), 'r2,r3');
verifier('limite jamais touchee : aucun', M.tradesApresPerteMax([perte1, repriseLente], 150).length, 0);
const faits2 = M.faitsDiscipline(jourD, Object.assign({ heuresPermises: '10:00-10:35' }, rgD));
verifier('fait "continue apres la perte max" present', faits2.some(f => f.cle === 'continue' && !f.ok), true);
verifier('2 trades hors des heures 10:00-10:35', faits2.filter(f => f.cle === 'heures')[0].texte.indexOf('2 trade') === 0, true);

titre('16. Qualite du setup et objectif de la veille');
const tq = (q, net) => ({ cle: 'q' + Math.random(), qualite: q, net, brut: net, commission: 0, qte: 1, fermeture: h('10:00:00') });
const aq = M.analyseQualite([tq('A+', 300), tq('A', 100), tq('B', -150), tq('C', -200), tq('C', 50), tq(undefined, 999)]);
verifier('5 trades notes (le 6e ne l\'est pas)', aq.nbNotes, 5);
verifier('tous les trades notes : +100', aq.netNotes, 100);
verifier('seulement A+ et A : +400', aq.netBons, 400);
verifier('les C : 2 trades', aq.groupes[3].nb, 2);
const aqD = M.analyseQualite([tq('A+', 300), tq('D', -400), tq('D', -100)]);
verifier('la note D est comptee', aqD.nbNotes, 3);
verifier('les D : 2 trades, -500', aqD.groupes[4].net, -500);
verifier('sans les D, seulement A+ et A : +300', aqD.netBons, 300);
const anObj = M.analyseDiscipline([
  { date: '2026-09-01', objectifTenu: true }, { date: '2026-09-02', objectifTenu: true },
  { date: '2026-09-03', objectifTenu: false }
], { '2026-09-01': pj(100, 1), '2026-09-02': pj(50, 1), '2026-09-03': pj(-90, 2) }, {});
verifier('objectif tenu 2 fois', anObj.objectifs.tenus, 2);
verifier('profit moyen quand tenu', anObj.objectifs.moyenneTenu, 75);
verifier('profit moyen quand pas tenu', anObj.objectifs.moyennePasTenu, -90);

console.log('\n' + '='.repeat(58));
console.log(reussites + ' verifications reussies, ' + echecs + ' echec(s).');
console.log('='.repeat(58));
process.exit(echecs ? 1 : 0);
