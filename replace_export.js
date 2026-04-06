const fs = require('fs');
let content = fs.readFileSync('C:/Users/sebas/Desktop/ClaudeProjets/kinebilan/index.html', 'utf8');

const startMarker = '// ============================================================\r\n// EXPORT WORD\r\n// ============================================================\r\nasync function exportWord()';
const endMarker = '\r\n// ============================================================\r\n// UTILS';

const start = content.indexOf(startMarker);
const end = content.indexOf(endMarker);

const newFn = `// ============================================================
// EXPORT PDF
// ============================================================
function exportPDF() {
  const p = getPatient();
  if (!p) return;

  const field = (label, value) => value
    ? \`<tr><td style="font-weight:600;padding:3px 12px 3px 0;white-space:nowrap;color:#444">\${label}</td><td style="padding:3px 0;color:#222">\${value}</td></tr>\`
    : '';

  const images = [['VVS', p.captureVVS], ['HCTSIB', p.captureHCTSIB]]
    .filter(([, src]) => src)
    .map(([label, src]) => \`<div style="margin-bottom:24px"><div style="font-weight:600;font-size:11pt;margin-bottom:8px;color:#444">\${label}</div><img src="\${src}" style="max-width:100%;border:1px solid #e0e0e0;border-radius:6px"/></div>\`)
    .join('');

  const html = \`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<title>CR_\${p.nom}_\${p.prenom}_\${p.dateEval || 'bilan'}</title>
<style>
  @page { size: A4; margin: 20mm 18mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #222; margin: 0; }
  h1 { font-size: 13pt; font-weight: 700; text-align: center; margin: 0 0 20px; letter-spacing: 0.5px; }
  h2 { font-size: 12pt; font-weight: 700; color: #126477; margin: 20px 0 4px; padding-bottom: 3px; border-bottom: 2px solid #126477; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 8px; }
  .cr { font-size: 11pt; line-height: 1.7; }
  .footer { margin-top: 32px; padding-top: 10px; border-top: 1px solid #ccc; text-align: center; font-size: 9pt; color: #6f797c; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<h1>COMPTE RENDU BILAN KINÉSITHÉRAPIQUE VESTIBULAIRE</h1>
<h2>IDENTIFICATION DU PATIENT</h2>
<table>
  \${field('Nom', (p.prenom || '') + ' ' + (p.nom || ''))}
  \${field('Âge', p.age ? p.age + ' ans' : '')}
  \${field('Profession', p.profession)}
  \${field('Loisirs', p.loisirs)}
  \${field("Date de l'évaluation", p.dateEval)}
  \${field('Prescripteur', p.prescripteur ? p.prescripteur + (p.datePrescription ? ' (ordonnance du ' + p.datePrescription + ')' : '') : '')}
  \${field('Médecin traitant', p.mt)}
  \${field('Motif de consultation', p.motif)}
</table>
\${p.b1CR ? '<h2>BILAN CLINIQUE</h2><div class="cr">' + p.b1CR + '</div>' : ''}
\${p.b2CR ? '<h2>EXAMEN VIA RÉALITÉ VIRTUELLE</h2><div class="cr">' + p.b2CR + '</div>' : ''}
\${images ? '<h2>EXAMENS GRAPHIQUES</h2>' + images : ''}
<div class="footer">
  PhysioLab — Kinésithérapeute D.E. — DIU vertige et rééducation vestibulaire PARIS VI<br>
  Pôle Santé Argouges — 42 rue de Beauvais 14400 BAYEUX — 06.11.77.70.76 — sp.mck.kine@gmail.com
</div>
</body>
</html>\`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };

  p.statut = 'exporte';
  p.lastMod = new Date().toLocaleString('fr-FR');
  savePatients();
  renderDashboard();
  updateStepper(p);
  showToast('PDF généré', 'picture_as_pdf');
}`;

content = content.slice(0, start) + newFn + content.slice(end);
fs.writeFileSync('C:/Users/sebas/Desktop/ClaudeProjets/kinebilan/index.html', content, 'utf8');
console.log('Done, start:', start, 'end:', end);
