const fs = require('fs');
let content = fs.readFileSync('C:/Users/sebas/Desktop/ClaudeProjets/kinebilan/index.html', 'utf8');

const startMarker = '// ============================================================\r\n// EXPORT PDF\r\n// ============================================================\r\nfunction exportPDF()';
const endMarker = '\r\n// ============================================================\r\n// UTILS';

const start = content.indexOf(startMarker);
const end = content.indexOf(endMarker);

if (start === -1 || end === -1) {
  console.error('Markers not found! start:', start, 'end:', end);
  process.exit(1);
}

const newFn = `// ============================================================
// EXPORT PDF
// ============================================================
function exportPDF() {
  const p = getPatient();
  if (!p) return;

  const esc = (str) => (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const headerRow = (label, value) => value
    ? \`<div class="hrow"><span class="hlabel">\${esc(label)}</span><span class="hvalue">\${esc(value)}</span></div>\`
    : '';

  // Construire le bloc en-tête patient
  const patientHeader = \`
    <div class="patient-header">
      <div class="patient-header-title">COMPTE RENDU DE BILAN KINÉSITHÉRAPIQUE VESTIBULAIRE</div>
      <div class="patient-header-grid">
        \${headerRow('Patient', (p.prenom || '') + ' ' + (p.nom || ''))}
        \${headerRow('Âge', p.age ? p.age + ' ans' : '')}
        \${p.profession ? headerRow('Profession', p.profession) : ''}
        \${p.loisirs ? headerRow('Loisirs', p.loisirs) : ''}
        \${headerRow("Date d'évaluation", p.dateEval)}
        \${p.prescripteur ? headerRow('Prescripteur', p.prescripteur + (p.datePrescription ? ' — ordonnance du ' + p.datePrescription : '')) : ''}
        \${p.mt ? headerRow('Médecin traitant', p.mt) : ''}
        \${p.motif ? headerRow('Motif', p.motif) : ''}
      </div>
    </div>
  \`;

  // Section numérotée
  let sectionNum = 0;
  const section = (title, content) => {
    sectionNum++;
    return \`
      <div class="section">
        <div class="section-header">
          <span class="section-num">\${sectionNum}</span>
          <span class="section-title">\${title}</span>
        </div>
        <div class="section-rule"></div>
        <div class="section-content">\${content}</div>
      </div>
    \`;
  };

  // Image sur sa propre page
  const imgPage = (label, src) => src ? \`
    <div class="img-page">
      <div class="img-label">\${label}</div>
      <img src="\${src}" class="capture-img"/>
    </div>
  \` : '';

  const sectionsHtml = [
    p.b1CR ? section('BILAN CLINIQUE', p.b1CR) : '',
    p.b2CR ? section('EXAMEN VIA RÉALITÉ VIRTUELLE', p.b2CR) : '',
    (p.captureVVS || p.captureHCTSIB) ? section('EXAMENS GRAPHIQUES',
      imgPage('Verticale Visuelle Subjective (VVS)', p.captureVVS) +
      imgPage('HCTSIB / Posturographie', p.captureHCTSIB)
    ) : ''
  ].filter(Boolean).join('');

  const html = \`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<title>CR_\${esc(p.nom)}_\${esc(p.prenom)}_\${esc(p.dateEval || 'bilan')}</title>
<style>
  @page {
    size: A4;
    margin: 18mm 18mm 28mm 18mm;
    @bottom-center {
      content: "";
    }
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: Arial, sans-serif;
    font-size: 10.5pt;
    color: #1a1a1a;
    line-height: 1.55;
  }

  /* ---- EN-TÊTE PATIENT ---- */
  .patient-header {
    border: 1.5px solid #126477;
    border-radius: 6px;
    padding: 14px 18px 10px;
    margin-bottom: 22px;
    background: #f7fcfd;
  }
  .patient-header-title {
    font-size: 12pt;
    font-weight: 700;
    color: #126477;
    text-align: center;
    margin-bottom: 12px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .patient-header-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px 24px;
  }
  .hrow { display: flex; gap: 6px; font-size: 10pt; }
  .hlabel { font-weight: 700; color: #126477; white-space: nowrap; min-width: 120px; }
  .hvalue { color: #222; }

  /* ---- SECTIONS ---- */
  .section { margin-bottom: 24px; page-break-inside: avoid; }
  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }
  .section-num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    min-width: 24px;
    background: #126477;
    color: white;
    font-weight: 700;
    font-size: 11pt;
    border-radius: 50%;
  }
  .section-title {
    font-size: 12pt;
    font-weight: 700;
    color: #126477;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .section-rule {
    height: 2px;
    background: linear-gradient(to right, #126477, #e0eef1);
    margin-bottom: 10px;
    border-radius: 1px;
  }
  .section-content {
    font-size: 10.5pt;
    line-height: 1.65;
    color: #222;
  }
  .section-content h1, .section-content h2, .section-content h3 {
    font-size: 11pt;
    color: #126477;
    margin: 12px 0 4px;
  }
  .section-content ul, .section-content ol { padding-left: 20px; margin: 4px 0; }
  .section-content p { margin-bottom: 6px; }
  .section-content strong { color: #126477; }

  /* ---- CAPTURES ---- */
  .img-page {
    page-break-before: always;
    text-align: center;
    padding-top: 10px;
  }
  .img-label {
    font-weight: 700;
    font-size: 11pt;
    color: #126477;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .capture-img {
    max-width: 100%;
    max-height: 200mm;
    border: 1px solid #cde4ea;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(18,100,119,0.08);
  }

  /* ---- PIED DE PAGE ---- */
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 22mm;
    border-top: 1.5px solid #126477;
    padding-top: 5px;
    text-align: center;
    font-size: 8.5pt;
    color: #4a6a72;
    background: white;
  }
  .footer-name {
    font-weight: 700;
    font-size: 9.5pt;
    color: #126477;
    margin-bottom: 2px;
  }
  .footer-coords { font-size: 8.5pt; color: #5a7a82; }

  .page-num {
    position: fixed;
    bottom: 4mm;
    right: 18mm;
    font-size: 8pt;
    color: #8aacb4;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .img-page:first-child { page-break-before: avoid; }
  }
</style>
</head>
<body>

\${patientHeader}
\${sectionsHtml}

<div class="footer">
  <div class="footer-name">MACKAY Sébastien</div>
  <div class="footer-coords">
    Masseur Kinésithérapeute D.E. &nbsp;|&nbsp; Cabinet de rééducation vestibulaire &nbsp;|&nbsp; DIU vertiges et rééducation vestibulaire PARIS VI<br>
    Pôle Santé Argouges — 42 rue de Beauvais, 14400 BAYEUX &nbsp;|&nbsp; 06.11.77.70.76 &nbsp;|&nbsp; sp.mck.kine@gmail.com
  </div>
</div>
<div class="page-num">
  <span id="pageNum"></span>
</div>

<script>
window.onload = function() {
  window.print();
};
<\/script>
</body>
</html>\`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();

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
