const fs = require('fs');
let html = fs.readFileSync('C:/Users/sebas/Desktop/ClaudeProjets/kinebilan/index.html', 'utf8');
// Normalize line endings to LF
html = html.replace(/\r\n/g, '\n');

// ============================================================
// 1. Replace stepper
// ============================================================
const stepperStart = html.indexOf('  <!-- Stepper -->');
const stepperEnd   = html.indexOf('  <!-- Main grid -->');
if (stepperStart === -1 || stepperEnd === -1) { console.error('Stepper not found', stepperStart, stepperEnd); process.exit(1); }

const newStepper = `  <!-- Stepper -->
  <div class="mb-10">
    <div class="relative flex items-center justify-between w-full max-w-lg">
      <div class="absolute top-5 left-0 w-full h-[2px] bg-surface-container-highest z-0"></div>
      <div id="stepper-bar" class="absolute top-5 left-0 h-[2px] bg-primary z-0 transition-all duration-500" style="width:0%"></div>
      <div class="step-item relative z-10 flex flex-col items-center gap-1.5" data-step="0">
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm ring-4 ring-surface-container-low bg-surface-container-highest text-on-surface-variant"><span class="material-symbols-outlined text-sm">edit_note</span></div>
        <span class="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">En cours</span>
      </div>
      <div class="step-item relative z-10 flex flex-col items-center gap-1.5" data-step="1">
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm ring-4 ring-surface-container-low bg-surface-container-highest text-on-surface-variant"><span class="material-symbols-outlined text-sm">photo_camera</span></div>
        <span class="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">Captures</span>
      </div>
      <div class="step-item relative z-10 flex flex-col items-center gap-1.5" data-step="2">
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm ring-4 ring-surface-container-low bg-surface-container-highest text-on-surface-variant"><span class="material-symbols-outlined text-sm">picture_as_pdf</span></div>
        <span class="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">Export</span>
      </div>
      <div class="step-item relative z-10 flex flex-col items-center gap-1.5" data-step="3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm ring-4 ring-surface-container-low bg-surface-container-highest text-on-surface-variant"><span class="material-symbols-outlined text-sm">inventory_2</span></div>
        <span class="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">Archivé</span>
      </div>
    </div>
  </div>

`;

html = html.slice(0, stepperStart) + newStepper + html.slice(stepperEnd);

// ============================================================
// 2. Replace main grid
// ============================================================
const gridStart = html.indexOf('  <!-- Main grid -->');
const gridEnd   = html.indexOf('\n</div>\n\n<!-- Toast -->');
if (gridStart === -1 || gridEnd === -1) { console.error('Main grid markers not found', gridStart, gridEnd); process.exit(1); }

const newGrid = `  <!-- Main grid -->
  <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">

    <!-- LEFT: Transcription unique -->
    <section class="xl:col-span-8 space-y-6">
      <div class="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(44,62,80,0.06)]">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-2xl font-headline font-semibold flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">analytics</span> Transcription
          </h2>
          <span id="b1-badge" class="px-3 py-1 bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase rounded-full">En attente</span>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Transcription audio brute</label>
            <textarea id="b1-transcription" rows="9"
              class="w-full p-4 bg-surface-container text-sm rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-on-surface-variant/40 font-mono"
              placeholder="Collez ici la transcription complète (anamnèse, examen clinique, examen vestibulaire, séance réalité virtuelle...)"></textarea>
          </div>
          <div class="flex justify-center">
            <button onclick="genererCR()" id="btn-gen-b1" class="group flex items-center gap-3 px-8 py-3.5 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all active:scale-95">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
              Générer le CR avec l'IA
            </button>
          </div>
          <div id="b1-cr-container" class="hidden mt-4">
            <div class="flex items-center justify-between mb-3">
              <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Compte-rendu structuré</label>
              <button onclick="genererCR()" class="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">refresh</span> Regénérer
              </button>
            </div>
            <div id="b1-cr" contenteditable="true"
              class="editable-cr bg-surface-container-low p-6 rounded-xl text-sm text-on-surface leading-relaxed min-h-24 focus:ring-2 focus:ring-primary/15 transition-shadow">
            </div>
            <p class="text-xs text-on-surface-variant mt-2 italic">Texte éditable directement — cliquez pour modifier</p>
          </div>
        </div>
      </div>
    </section>

    <!-- RIGHT sidebar -->
    <aside class="xl:col-span-4 space-y-5">

      <!-- Captures -->
      <div class="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-xl font-headline font-semibold">Captures</h2>
          <span id="captures-count" class="text-xs font-bold text-on-surface-variant">0/2</span>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="upload-vvs" class="block cursor-pointer">
              <div id="preview-vvs" class="aspect-square bg-surface-container flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant/40 hover:border-primary/50 transition-colors group">
                <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary mb-1">add_a_photo</span>
                <span class="text-[10px] font-bold text-on-surface-variant group-hover:text-primary text-center px-1">VVS</span>
              </div>
            </label>
            <input id="upload-vvs" type="file" accept="image/*" class="hidden" onchange="handleCapture('vvs', this)"/>
            <button id="del-vvs" onclick="deleteCapture('vvs')" class="hidden w-full mt-1 text-xs text-error text-center hover:underline">Supprimer</button>
          </div>
          <div>
            <label for="upload-hctsib" class="block cursor-pointer">
              <div id="preview-hctsib" class="aspect-square bg-surface-container flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant/40 hover:border-primary/50 transition-colors group">
                <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary mb-1">add_a_photo</span>
                <span class="text-[10px] font-bold text-on-surface-variant group-hover:text-primary text-center px-1">HCTSIB</span>
              </div>
            </label>
            <input id="upload-hctsib" type="file" accept="image/*" class="hidden" onchange="handleCapture('hctsib', this)"/>
            <button id="del-hctsib" onclick="deleteCapture('hctsib')" class="hidden w-full mt-1 text-xs text-error text-center hover:underline">Supprimer</button>
          </div>
        </div>
      </div>

      <!-- Export -->
      <div class="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
        <h2 class="text-xl font-headline font-semibold mb-5">Finalisation</h2>
        <button id="btn-gen-word-sidebar" onclick="exportPDF()" disabled
          class="w-full py-3.5 bg-surface-container text-on-surface-variant/50 cursor-not-allowed rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all">
          <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
          Générer PDF (.pdf)
        </button>
        <p id="export-help" class="mt-3 text-[10px] text-on-surface-variant text-center leading-relaxed">Générez le CR pour activer l'export PDF.</p>
      </div>
    </aside>
  </div>`;

html = html.slice(0, gridStart) + newGrid + html.slice(gridEnd);

// ============================================================
// 3. Update top-bar export button (search for exportWord variant)
// ============================================================
// Find id="btn-export-word" or any top-bar button containing exportWord
var btnOldIdx = html.indexOf('onclick="exportWord()"');
if (btnOldIdx !== -1) {
  // Replace that specific button block in topbar (just the onclick + label part)
  html = html.replace('onclick="exportWord()"', 'onclick="exportPDF()" id="btn-export-word"');
  html = html.replace(/<span class="material-symbols-outlined text-lg">description<\/span> Export Word/, '<span class="material-symbols-outlined text-lg">picture_as_pdf</span> Export PDF');
}

// ============================================================
// 4. Replace JS functions
// ============================================================

// 4a. genererCR
var genCRStart = html.indexOf('// IA — Génération CR\n// ============================================================\nasync function genererCR(');
if (genCRStart === -1) {
  genCRStart = html.indexOf('async function genererCR(');
}
var genCREnd = html.indexOf('\nfunction regenererCR(');
if (genCRStart === -1 || genCREnd === -1) { console.error('genererCR not found', genCRStart, genCREnd); process.exit(1); }

var beforeGenCR = html.lastIndexOf('\n// ============================================================\n// IA', genCRStart);
var genSectionStart = beforeGenCR !== -1 ? beforeGenCR + 1 : genCRStart;

const newGenCR = `// ============================================================
// IA — Génération CR
// ============================================================
async function genererCR() {
  var transcription = document.getElementById('b1-transcription').value.trim();
  if (!transcription) { showToast('Transcription vide', 'error'); return; }
  var btn = document.getElementById('btn-gen-b1');
  var originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> Génération en cours...';
  btn.disabled = true;
  var p = getPatient();
  var contextPatient = p ? ('Patient : ' + p.prenom + ' ' + p.nom + '.') : '';
  try {
    var response = await fetch('https://kinebilan-worker.sp-mck-kine.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: SYSTEM_PROMPT_B1,
        messages: [{ role: 'user', content: contextPatient + '\\n\\nTRANSCRIPTION :\\n' + transcription }]
      })
    });
    var responseText = await response.text();
    var data;
    try { data = JSON.parse(responseText); }
    catch(e) { throw new Error('Réponse invalide : ' + responseText.slice(0, 200)); }
    if (!response.ok) { throw new Error((data && data.error && data.error.message) || (data && data.error) || 'Erreur API ' + response.status); }
    var crText = data.content[0].text;
    var crBody = crText;
    var firstLine = crText.split('\\n')[0].trim();
    if (firstLine.indexOf('PATIENT:') === 0) {
      try {
        var pd = JSON.parse(firstLine.slice(8));
        if (pd.age) p.age = pd.age;
        if (pd.profession) p.profession = pd.profession;
        if (pd.loisirs) p.loisirs = pd.loisirs;
        if (pd.prescripteur) p.prescripteur = pd.prescripteur;
        if (pd.mt) p.mt = pd.mt;
        if (pd.motif) p.motif = pd.motif;
        if (pd.dateEval) p.dateEval = pd.dateEval;
      } catch(e) { console.warn('Patient data parse error:', e); }
      crBody = crText.split('\\n').slice(1).join('\\n').replace(/^\\s*\\n/, '');
    }
    var crHTML = markdownToHtml(crBody);
    document.getElementById('b1-cr').innerHTML = crHTML;
    document.getElementById('b1-cr-container').classList.remove('hidden');
    document.getElementById('b1-badge').textContent = 'Généré';
    document.getElementById('b1-badge').className = 'px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[11px] font-bold uppercase rounded-full';
    if (p) {
      p.b1Transcription = transcription;
      p.b1CR = crHTML;
      p.statut = 'en_cours';
      savePatients();
      updateExportButton(p);
      renderDashboard();
    }
    showToast('CR généré', 'auto_awesome');
  } catch (e) {
    showToast('Erreur : ' + e.message, 'error');
    console.error(e);
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}`;

html = html.slice(0, genSectionStart) + newGenCR + html.slice(genCREnd);

// 4b. Replace regenererCR
html = html.replace(/function regenererCR\([^)]*\)\s*\{[^}]*\}/, 'function regenererCR() { genererCR(); }');

// 4c. Remove validerCR
var valStart = html.indexOf('\nfunction validerCR(');
var valEnd   = html.indexOf('\n// ============================================================\n// CAPTURES');
if (valStart !== -1 && valEnd !== -1) {
  html = html.slice(0, valStart) + html.slice(valEnd);
}

// 4d. Replace updateChecklist with updateExportButton
var chkStart = html.indexOf('// CHECKLIST & STEPPER\n// ============================================================\nfunction updateChecklist(p)');
if (chkStart === -1) {
  chkStart = html.indexOf('function updateChecklist(p)');
}
var chkSectionStart = html.lastIndexOf('// ============================================================\n// CHECKLIST', chkStart);
if (chkSectionStart === -1) chkSectionStart = chkStart;
var chkEnd = html.indexOf('\nfunction updateStepper(p)');
if (chkStart === -1 || chkEnd === -1) { console.error('updateChecklist not found', chkStart, chkEnd); process.exit(1); }

const newUpdateExport = `// ============================================================
// CHECKLIST & STEPPER
// ============================================================
function updateExportButton(p) {
  var hasCR = !!(p && p.b1CR && p.b1CR.length > 10);
  var btnSidebar = document.getElementById('btn-gen-word-sidebar');
  var btnTop = document.getElementById('btn-export-word');
  var help = document.getElementById('export-help');
  if (hasCR) {
    if (btnSidebar) { btnSidebar.disabled = false; btnSidebar.className = 'w-full py-3.5 bg-gradient-to-br from-primary to-primary-container text-white cursor-pointer rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md'; }
    if (btnTop) { btnTop.disabled = false; btnTop.className = 'flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-medium text-sm hover:opacity-90 transition-colors shadow-md'; }
    if (help) help.textContent = 'CR pret — generez votre PDF.';
  } else {
    if (btnSidebar) { btnSidebar.disabled = true; btnSidebar.className = 'w-full py-3.5 bg-surface-container text-on-surface-variant/50 cursor-not-allowed rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2'; }
    if (btnTop) { btnTop.disabled = true; btnTop.className = 'flex items-center gap-2 px-5 py-2.5 bg-surface-container-high text-primary rounded-xl font-medium text-sm opacity-40 cursor-not-allowed'; }
    if (help) help.textContent = 'Generez le CR pour activer l\\'export PDF.';
  }
}
function updateChecklist(p) { updateExportButton(p); }`;

html = html.slice(0, chkSectionStart) + newUpdateExport + html.slice(chkEnd);

// 4e. Replace updateStepper
var stepFnStart = html.indexOf('\nfunction updateStepper(p)');
var stepFnEnd   = html.indexOf('\n// ============================================================\n// EXPORT');
if (stepFnStart === -1 || stepFnEnd === -1) { console.error('updateStepper not found', stepFnStart, stepFnEnd); process.exit(1); }

const newStepperFn = `
function updateStepper(p) {
  var steps = document.querySelectorAll('.step-item');
  var stepMap = { bilan1: 0, en_cours: 0, bilan2: 1, captures: 1, exporte: 2, envoye: 3, archive: 3 };
  var currentStep = stepMap[p.statut] !== undefined ? stepMap[p.statut] : 0;
  var pct = [0, 33, 66, 100][currentStep] || 0;
  document.getElementById('stepper-bar').style.width = pct + '%';
  steps.forEach(function(s, i) {
    var dot = s.querySelector('div');
    var cls = dot.className;
    if (i < currentStep) {
      dot.className = cls.replace('bg-surface-container-highest text-on-surface-variant', 'bg-primary text-white');
    } else if (i === currentStep) {
      dot.className = cls.replace('bg-surface-container-highest text-on-surface-variant', 'bg-primary/20 text-primary');
    }
  });
}`;

html = html.slice(0, stepFnStart) + newStepperFn + html.slice(stepFnEnd);

// 4f. Simplify saveCurrentPatient
html = html.replace(
  /p\.b1Transcription = document\.getElementById\('b1-transcription'\)\.value;[\s\S]*?p\.b2CR = document\.getElementById\('b2-cr'\)\.innerHTML;\s*\}/,
  "p.b1Transcription = document.getElementById('b1-transcription').value;\n  p.b1CR = document.getElementById('b1-cr').innerHTML;"
);

// 4g. Replace ouvrirPatient
var ouvrirStart = html.indexOf('function ouvrirPatient(id)');
var ouvrirEnd   = html.indexOf('\nfunction saveCurrentPatient()');
if (ouvrirStart !== -1 && ouvrirEnd !== -1) {
  const newOuvrir = `function ouvrirPatient(id) {
  currentPatientId = id;
  var p = getPatient();
  if (!p) return;
  document.getElementById('bilan-patient-name').textContent = p.prenom + ' ' + p.nom;
  document.getElementById('bilan-lastmod').textContent = 'Modifie : ' + (p.lastMod || '');
  document.getElementById('b1-transcription').value = p.b1Transcription || '';
  if (p.b1CR) {
    document.getElementById('b1-cr').innerHTML = p.b1CR;
    document.getElementById('b1-cr-container').classList.remove('hidden');
  } else {
    document.getElementById('b1-cr-container').classList.add('hidden');
  }
  renderCapture('vvs', p.captureVVS);
  renderCapture('hctsib', p.captureHCTSIB);
  updateCapturesCount(p);
  updateExportButton(p);
  updateStepper(p);
  showView('bilan');
}`;
  html = html.slice(0, ouvrirStart) + newOuvrir + html.slice(ouvrirEnd);
}

// ============================================================
// 5. Add exportPDF before the EXPORT section
// ============================================================
var exportSection = html.indexOf('\n// ============================================================\n// EXPORT');
if (exportSection !== -1) {
  const pdfFn = `
// ============================================================
// EXPORT PDF
// ============================================================
function exportPDF() {
  var p = getPatient();
  if (!p) return;

  function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function hrow(label, value) {
    if (!value) return '';
    return '<tr><td style="font-weight:700;padding:3px 14px 3px 0;color:#126477;white-space:nowrap;font-size:10pt">' + esc(label) + '</td><td style="padding:3px 0;color:#222;font-size:10pt">' + esc(value) + '</td></tr>';
  }

  var prescInfo = p.prescripteur ? (p.prescripteur + (p.datePrescription ? ' \u2014 ordonnance du ' + p.datePrescription : '')) : '';

  var images = [['Verticale Visuelle Subjective (VVS)', p.captureVVS], ['HCTSIB / Posturographie', p.captureHCTSIB]]
    .filter(function(r){ return r[1]; })
    .map(function(r){ return '<div style="page-break-before:always;text-align:center;padding-top:10px"><div style="font-weight:700;font-size:11pt;color:#126477;margin-bottom:16px;text-transform:uppercase">' + r[0] + '</div><img src="' + r[1] + '" style="max-width:100%;max-height:180mm;border:1px solid #cde4ea;border-radius:6px"/></div>'; })
    .join('');

  var css = '@page{size:A4;margin:18mm 18mm 28mm 18mm}'
    + '*{box-sizing:border-box;margin:0;padding:0}'
    + 'body{font-family:Arial,sans-serif;font-size:10.5pt;color:#1a1a1a;line-height:1.55}'
    + 'h2{font-size:12pt;font-weight:700;color:#126477;margin:20px 0 4px;padding-bottom:3px;border-bottom:2px solid #126477}'
    + 'strong{color:#126477}'
    + '.cr{font-size:10.5pt;line-height:1.65}'
    + '.footer{position:fixed;bottom:0;left:0;right:0;border-top:1.5px solid #126477;padding:6px 18mm;text-align:center;background:white;font-family:Arial,sans-serif}'
    + '@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';

  var patientBlock = '<div style="border:1.5px solid #126477;border-radius:6px;padding:14px 18px 10px;margin-bottom:22px;background:#f7fcfd">'
    + '<div style="font-size:12pt;font-weight:700;color:#126477;text-align:center;margin-bottom:12px;text-transform:uppercase">COMPTE RENDU DE BILAN KIN\u00c9SITH\u00c9RAPIQUE VESTIBULAIRE</div>'
    + '<table style="border-collapse:collapse;width:100%">'
    + hrow('Patient', ((p.prenom||'') + ' ' + (p.nom||'')).trim())
    + hrow('\u00c2ge', p.age)
    + hrow('Profession', p.profession)
    + hrow('Loisirs', p.loisirs)
    + hrow("Date d'\u00e9valuation", p.dateEval)
    + hrow('Prescripteur', prescInfo)
    + hrow('M\u00e9decin traitant', p.mt)
    + hrow('Motif', p.motif)
    + '</table></div>';

  var body = patientBlock
    + (p.b1CR ? '<div class="cr">' + p.b1CR + '</div>' : '')
    + images;

  var footer = '<div class="footer">'
    + '<div style="font-weight:700;font-size:9.5pt;color:#126477">MACKAY S\u00e9bastien</div>'
    + '<div style="font-size:8.5pt;color:#5a7a82">Masseur Kin\u00e9sith\u00e9rapeute D.E. &nbsp;|\u00a0DIU vertiges et r\u00e9\u00e9ducation vestibulaire PARIS VI<br>P\u00f4le Sant\u00e9 Argouges \u2014 42 rue de Beauvais, 14400 BAYEUX &nbsp;|\u00a0 06.11.77.70.76 &nbsp;|\u00a0 sp.mck.kine@gmail.com</div>'
    + '</div>';

  var doc = '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/><title>CR_' + esc(p.nom) + '_' + esc(p.prenom) + '</title><style>' + css + '</style></head><body>' + body + footer + '</body></html>';

  var win = window.open('', '_blank');
  win.document.write(doc);
  win.document.close();
  win.onload = function() { win.focus(); win.print(); };

  p.statut = 'exporte';
  p.lastMod = new Date().toLocaleString('fr-FR');
  savePatients();
  renderDashboard();
  updateStepper(p);
  showToast('PDF genere', 'picture_as_pdf');
}
`;
  html = html.slice(0, exportSection + 1) + pdfFn + html.slice(exportSection + 1);
}

// ============================================================
// 6. Fix status labels in renderDashboard
// ============================================================
html = html.replace(
  "bilan1: { label: 'Bilan 1', cls: 'bg-tertiary-container text-on-tertiary-container' }",
  "bilan1: { label: 'En cours', cls: 'bg-tertiary-container text-on-tertiary-container' }"
);
html = html.replace(
  "bilan2: { label: 'Bilan 2', cls: 'bg-primary/10 text-primary' }",
  "bilan2: { label: 'En cours', cls: 'bg-tertiary-container text-on-tertiary-container' },\n    en_cours: { label: 'En cours', cls: 'bg-tertiary-container text-on-tertiary-container' }"
);

// ============================================================
// Write file
// ============================================================
fs.writeFileSync('C:/Users/sebas/Desktop/ClaudeProjets/kinebilan/index.html', html, 'utf8');
console.log('Done — file written');
