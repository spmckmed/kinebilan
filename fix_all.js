// fix_all.js - Apply all 7 changes to index.html
var fs = require('fs');
var path = require('path');

var filePath = 'C:/Users/sebas/Desktop/ClaudeProjets/kinebilan/index.html';
var content = fs.readFileSync(filePath, 'utf8');
var original = content;

function check(label, idx) {
  if (idx === -1) { console.error('NOT FOUND: ' + label); process.exit(1); }
  console.log('OK: ' + label + ' at ' + idx);
}

// ============================================================
// CHANGE 1: Add docx CDN in <head>
// ============================================================
var anchor1 = '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols';
check('anchor1 (Material Symbols link)', content.indexOf(anchor1));
content = content.replace(
  anchor1,
  '<script src="https://unpkg.com/docx@7.8.2/build/index.js"></script>\n' + anchor1
);
check('change1 result', content.indexOf('unpkg.com/docx@7.8.2'));

// ============================================================
// CHANGE 2: Simplify the "Nouveau patient" form
// ============================================================
var formOld = '<div class="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(44,62,80,0.06)] space-y-5">';
check('formOld', content.indexOf(formOld));

// Find form end by tracking div depth
var formStart = content.indexOf(formOld);
var depth = 0;
var pos = formStart;
while (pos < content.length) {
  if (content[pos] === '<') {
    if (content.substring(pos, pos + 5) === '<div ') depth++;
    else if (content.substring(pos, pos + 4) === '<div') depth++;
    else if (content.substring(pos, pos + 6) === '</div>') {
      depth--;
      if (depth === 0) {
        var formEnd = pos + 6;
        break;
      }
    }
  }
  pos++;
}
console.log('Form end at:', formEnd);

var formNew = '<div class="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(44,62,80,0.06)] space-y-5">\n    <div class="grid grid-cols-2 gap-4">\n      <div>\n        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Nom *</label>\n        <input id="p-nom" type="text" placeholder="Dupont" class="w-full px-4 py-2.5 bg-surface-container rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/20 outline-none"/>\n      </div>\n      <div>\n        <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Pr\u00e9nom *</label>\n        <input id="p-prenom" type="text" placeholder="Jean" class="w-full px-4 py-2.5 bg-surface-container rounded-xl text-sm border-none focus:ring-2 focus:ring-primary/20 outline-none"/>\n      </div>\n    </div>\n    <p class="text-xs text-on-surface-variant bg-surface-container rounded-xl px-4 py-3">\n      <span class="material-symbols-outlined text-sm align-middle mr-1">auto_awesome</span>\n      L\'âge, la profession, le prescripteur, le motif et les autres informations seront extraits automatiquement par l\'IA depuis la transcription audio du bilan.\n    </p>\n    <button onclick="creerPatient()" class="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-sm tracking-wide hover:opacity-90 transition-opacity mt-2">\n      Créer le dossier\n    </button>\n  </div>';

content = content.substring(0, formStart) + formNew + content.substring(formEnd);
check('change2 result', content.indexOf('extraits automatiquement par l\'IA'));

// ============================================================
// CHANGE 3: Remove p-date line from window.onload
// ============================================================
var pDateLine = "\n  document.getElementById('p-date').value = today;";
// Try CRLF version too
var pDateLineCRLF = "\r\n  document.getElementById('p-date').value = today;";
var idxPDate = content.indexOf(pDateLine);
var idxPDateCRLF = content.indexOf(pDateLineCRLF);
if (idxPDate !== -1) {
  content = content.replace(pDateLine, '');
  console.log('OK: change3 (LF version) removed p-date line');
} else if (idxPDateCRLF !== -1) {
  content = content.replace(pDateLineCRLF, '');
  console.log('OK: change3 (CRLF version) removed p-date line');
} else {
  console.error('NOT FOUND: p-date line');
  process.exit(1);
}

// ============================================================
// CHANGE 4: Replace creerPatient() function
// ============================================================
var creerStart = content.indexOf('function creerPatient()');
check('creerPatient start', creerStart);
// Find end of function - next function after it
var creerEnd = content.indexOf('\nfunction ', creerStart + 10);
check('creerPatient end marker', creerEnd);

var creerNew = 'function creerPatient() {\n  var nom = document.getElementById(\'p-nom\').value.trim();\n  var prenom = document.getElementById(\'p-prenom\').value.trim();\n  if (!nom || !prenom) { showToast(\'Nom et pr\u00e9nom requis\', \'error\'); return; }\n  var today = new Date().toISOString().split(\'T\')[0];\n  var p = {\n    id: Date.now().toString(),\n    nom: nom, prenom: prenom,\n    age: \'\', dateEval: today,\n    profession: \'\', loisirs: \'\',\n    prescripteur: \'\', datePrescription: \'\',\n    mt: \'\', motif: \'\',\n    statut: \'bilan1\',\n    b1Transcription: \'\', b1CR: \'\', b1Valide: false,\n    b2Transcription: \'\', b2CR: \'\', b2Valide: false,\n    captureVVS: null, captureHCTSIB: null,\n    lastMod: new Date().toLocaleString(\'fr-FR\'),\n  };\n  patients.push(p);\n  savePatients();\n  showToast(\'Dossier cr\u00e9\u00e9\', \'check\');\n  ouvrirPatient(p.id);\n  document.getElementById(\'p-nom\').value = \'\';\n  document.getElementById(\'p-prenom\').value = \'\';\n}';

content = content.substring(0, creerStart) + creerNew + content.substring(creerEnd);
check('change4 result', content.indexOf('var today = new Date().toISOString().split(\'T\')[0];'));

// ============================================================
// CHANGE 5: Update SYSTEM_PROMPT_B1 - add PATIENT: line extraction
// ============================================================
// Find the backtick start of the prompt content
var sysB1pos = content.indexOf('SYSTEM_PROMPT_B1');
check('SYSTEM_PROMPT_B1', sysB1pos);
var btStart = content.indexOf('`', sysB1pos);
check('backtick start', btStart);

// The first line ends at \r\n\r\n or \n\n before "À partir de"
var aPartirDe = content.indexOf('\u00c0 partir de la transcription du bilan initial', btStart);
check('A partir de la transcription', aPartirDe);

// Insert the PATIENT extraction text before "À partir de"
var insertText = 'En PREMI\u00c8RE ligne de ta r\u00e9ponse (avant tout contenu), \u00e9cris une ligne JSON au format EXACT :\nPATIENT:{"age":"","profession":"","loisirs":"","prescripteur":"","mt":"","motif":"","dateEval":""}\nRemplis uniquement les valeurs trouv\u00e9es dans la transcription. Pour dateEval utilise le format YYYY-MM-DD (date du jour si non mentionn\u00e9e). Laisse "" pour les champs introuvables. Cette ligne ne doit PAS appara\u00eetre dans le compte-rendu.\n\n';

content = content.substring(0, aPartirDe) + insertText + content.substring(aPartirDe);
check('change5 result', content.indexOf('PATIENT:{"age":""'));

// ============================================================
// CHANGE 6: Update genererCR() - replace const crText with parsing block
// ============================================================
var crTextOld = 'const crText = data.content[0].text;\n    const crHTML = markdownToHtml(crText);';
var crTextOldCRLF = 'const crText = data.content[0].text;\r\n    const crHTML = markdownToHtml(crText);';
var idxCrText = content.indexOf(crTextOld);
var idxCrTextCRLF = content.indexOf(crTextOldCRLF);

var crTextNew = 'var crText = data.content[0].text;\n    var crBody = crText;\n    var firstLine = crText.split(\'\\n\')[0].trim();\n    if (firstLine.indexOf(\'PATIENT:\') === 0) {\n      try {\n        var pd = JSON.parse(firstLine.slice(8));\n        if (pd.age) p.age = pd.age;\n        if (pd.profession) p.profession = pd.profession;\n        if (pd.loisirs) p.loisirs = pd.loisirs;\n        if (pd.prescripteur) p.prescripteur = pd.prescripteur;\n        if (pd.mt) p.mt = pd.mt;\n        if (pd.motif) p.motif = pd.motif;\n        if (pd.dateEval) p.dateEval = pd.dateEval;\n        savePatients();\n        var sidebarInfo = document.getElementById(\'patient-info-sidebar\');\n        if (sidebarInfo) {\n          sidebarInfo.innerHTML = [\n            [\'Age\', p.age ? p.age + \' ans\' : \'\'],\n            [\'Evaluation\', p.dateEval || \'\'],\n            [\'Prescripteur\', p.prescripteur || \'\'],\n            [\'MT\', p.mt || \'\'],\n            [\'Motif\', p.motif || \'\']\n          ].filter(function(r){ return r[1]; }).map(function(r){ return \'<div class="flex justify-between py-1 border-b border-outline-variant/30"><span class="text-xs text-on-surface-variant">\' + r[0] + \'</span><span class="text-xs font-medium text-right max-w-[60%]">\' + r[1] + \'</span></div>\'; }).join(\'\');\n        }\n      } catch(e) { console.warn(\'Patient data parse error:\', e); }\n      crBody = crText.split(\'\\n\').slice(1).join(\'\\n\').replace(/^\\s*\\n/, \'\');\n    }\n    var crHTML = markdownToHtml(crBody);';

if (idxCrText !== -1) {
  content = content.replace(crTextOld, crTextNew);
  console.log('OK: change6 (LF version)');
} else if (idxCrTextCRLF !== -1) {
  content = content.replace(crTextOldCRLF, crTextNew);
  console.log('OK: change6 (CRLF version)');
} else {
  console.error('NOT FOUND: crText block');
  process.exit(1);
}

// ============================================================
// CHANGE 7: Update contextPatient
// ============================================================
var ctxOld = 'const contextPatient = p ? `Patient : ${p.prenom} ${p.nom}, ${p.age} ans. Motif : ${p.motif}. Date \u00e9valuation : ${p.dateEval}.` : \'\';';
check('contextPatient old', content.indexOf(ctxOld));
var ctxNew = 'var contextPatient = p ? (\'Patient : \' + p.prenom + \' \' + p.nom + \'.\') : \'\';';
content = content.replace(ctxOld, ctxNew);
check('change7 result', content.indexOf("var contextPatient = p ? ('Patient : '"));

// ============================================================
// CHANGE 8a: Update button 1 (top bar)
// ============================================================
var btn1Old = 'onclick="exportPDF()" class="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high text-primary rounded-xl font-medium text-sm hover:bg-surface-container-highest transition-colors opacity-40 cursor-not-allowed" disabled>\n        <span class="material-symbols-outlined text-lg">picture_as_pdf</span> Export PDF';
var btn1OldCRLF = 'onclick="exportPDF()" class="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high text-primary rounded-xl font-medium text-sm hover:bg-surface-container-highest transition-colors opacity-40 cursor-not-allowed" disabled>\r\n        <span class="material-symbols-outlined text-lg">picture_as_pdf</span> Export PDF';
var btn1New = 'onclick="exportWord()" class="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high text-primary rounded-xl font-medium text-sm hover:bg-surface-container-highest transition-colors opacity-40 cursor-not-allowed" disabled>\n        <span class="material-symbols-outlined text-lg">description</span> Export Word';
var idxBtn1 = content.indexOf(btn1Old);
var idxBtn1CRLF = content.indexOf(btn1OldCRLF);
if (idxBtn1 !== -1) {
  content = content.replace(btn1Old, btn1New);
  console.log('OK: change8a (LF version)');
} else if (idxBtn1CRLF !== -1) {
  content = content.replace(btn1OldCRLF, btn1New);
  console.log('OK: change8a (CRLF version)');
} else {
  console.error('NOT FOUND: btn1Old');
  process.exit(1);
}
check('change8a result', content.indexOf('onclick="exportWord()"'));

// ============================================================
// CHANGE 8b: Update button 2 (sidebar)
// ============================================================
var btn2Old = 'onclick="exportPDF()" disabled\n          class="w-full py-3.5 bg-surface-container text-on-surface-variant/50 cursor-not-allowed rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all">\n          <span class="material-symbols-outlined text-sm">picture_as_pdf</span>\n          G\u00e9n\u00e9rer le PDF';
var btn2OldCRLF = 'onclick="exportPDF()" disabled\r\n          class="w-full py-3.5 bg-surface-container text-on-surface-variant/50 cursor-not-allowed rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all">\r\n          <span class="material-symbols-outlined text-sm">picture_as_pdf</span>\r\n          G\u00e9n\u00e9rer le PDF';
var idxBtn2 = content.indexOf(btn2Old);
var idxBtn2CRLF = content.indexOf(btn2OldCRLF);
var btn2New = 'onclick="exportWord()" disabled\n          class="w-full py-3.5 bg-surface-container text-on-surface-variant/50 cursor-not-allowed rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all">\n          <span class="material-symbols-outlined text-sm">description</span>\n          G\u00e9n\u00e9rer Word (.docx)';
if (idxBtn2 !== -1) {
  content = content.replace(btn2Old, btn2New);
  console.log('OK: change8b (LF version)');
} else if (idxBtn2CRLF !== -1) {
  content = content.replace(btn2OldCRLF, btn2New);
  console.log('OK: change8b (CRLF version)');
} else {
  console.error('NOT FOUND: btn2');
  // Try a more flexible search
  var btn2AltStart = content.indexOf('btn-gen-word-sidebar');
  if (btn2AltStart !== -1) {
    console.log('btn2 context:', JSON.stringify(content.substring(btn2AltStart - 10, btn2AltStart + 400)));
  }
  process.exit(1);
}

// ============================================================
// CHANGE 8c: Replace exportPDF function with exportWord
// ============================================================
var expPDFStart = content.indexOf('function exportPDF()');
check('exportPDF function start', expPDFStart);
// Find the end: '}// ============================================================'
// Try both LF and CRLF variants for the end marker
var expPDFEndMarker = '\n}// ============================================================\r\n// UTILS';
var expPDFEndIdx = content.indexOf(expPDFEndMarker, expPDFStart);
if (expPDFEndIdx === -1) {
  expPDFEndMarker = '\n}// ============================================================\n// UTILS';
  expPDFEndIdx = content.indexOf(expPDFEndMarker, expPDFStart);
}
if (expPDFEndIdx === -1) {
  // Fallback: find '}// ===' after expPDFStart
  expPDFEndIdx = content.indexOf('}// ============================================================', expPDFStart);
  if (expPDFEndIdx !== -1) expPDFEndIdx--; // point to the \n before }
}
check('exportPDF end marker', expPDFEndIdx);
// expPDFEndIdx points to \n before }// ===
// We want expPDFEnd to point to the character AFTER the }, i.e. skip \n and }
var expPDFEnd = expPDFEndIdx + 2; // skip \n and } so the separator comment remains

var exportWordFn = 'function exportWord() {\n  var p = getPatient();\n  if (!p) return;\n  if (!window.docx) { showToast(\'Biblioth\u00e8que docx non charg\u00e9e\', \'error\'); return; }\n  showToast(\'G\u00e9n\u00e9ration du fichier Word...\', \'description\');\n\n  try {\n    var Document = window.docx.Document;\n    var Packer = window.docx.Packer;\n    var Paragraph = window.docx.Paragraph;\n    var TextRun = window.docx.TextRun;\n    var ImageRun = window.docx.ImageRun;\n    var Footer = window.docx.Footer;\n    var Table = window.docx.Table;\n    var TableRow = window.docx.TableRow;\n    var TableCell = window.docx.TableCell;\n    var BorderStyle = window.docx.BorderStyle;\n    var WidthType = window.docx.WidthType;\n    var AlignmentType = window.docx.AlignmentType;\n\n    var nb = { style: BorderStyle.NONE, size: 0, color: \'FFFFFF\' };\n    var allNb = { top: nb, bottom: nb, left: nb, right: nb, insideHorizontal: nb, insideVertical: nb };\n\n    var footerSep = new Paragraph({\n      border: { top: { style: BorderStyle.SINGLE, size: 6, color: \'126477\', space: 6 } },\n      children: []\n    });\n    var footerTable = new Table({\n      width: { size: 100, type: WidthType.PERCENTAGE },\n      borders: allNb,\n      rows: [new TableRow({\n        children: [\n          new TableCell({\n            width: { size: 50, type: WidthType.PERCENTAGE },\n            borders: allNb,\n            children: [\n              new Paragraph({ children: [new TextRun({ text: \'MACKAY S\u00e9bastien\', bold: true, font: \'Arial\', size: 18, color: \'126477\' })] }),\n              new Paragraph({ children: [new TextRun({ text: \'Kin\u00e9sith\u00e9rapeute D.E. - Cabinet de r\u00e9\u00e9ducation vestibulaire\', font: \'Arial\', size: 14, color: \'6f797c\' })] }),\n              new Paragraph({ children: [new TextRun({ text: \'DIU vertige et r\u00e9\u00e9ducation vestibulaire PARIS VI\', font: \'Arial\', size: 14, color: \'6f797c\' })] })\n            ]\n          }),\n          new TableCell({\n            width: { size: 50, type: WidthType.PERCENTAGE },\n            borders: allNb,\n            children: [\n              new Paragraph({ children: [new TextRun({ text: \'P\u00f4le Sant\u00e9 Argouges\', font: \'Arial\', size: 14, color: \'6f797c\' })] }),\n              new Paragraph({ children: [new TextRun({ text: \'42 rue de Beauvais 14400 BAYEUX\', font: \'Arial\', size: 14, color: \'6f797c\' })] }),\n              new Paragraph({ children: [new TextRun({ text: \'06.11.77.70.76 - sp.mck.kine@gmail.com\', font: \'Arial\', size: 14, color: \'6f797c\' })] })\n            ]\n          })\n        ]\n      })]\n    });\n    var docFooter = new Footer({ children: [footerSep, footerTable] });\n\n    var children = [];\n\n    children.push(new Paragraph({\n      alignment: AlignmentType.CENTER,\n      spacing: { after: 200 },\n      children: [new TextRun({ text: \'COMPTE RENDU DE BILAN KIN\u00c9SITH\u00c9RAPIQUE VESTIBULAIRE\', bold: true, size: 28, font: \'Arial\', color: \'126477\' })]\n    }));\n\n    children.push(new Paragraph({\n      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: \'126477\', space: 2 } },\n      spacing: { before: 120, after: 80 },\n      children: [new TextRun({ text: \'IDENTIFICATION DU PATIENT\', bold: true, size: 24, font: \'Arial\', color: \'126477\' })]\n    }));\n\n    function addField(label, value) {\n      if (!value) return;\n      children.push(new Paragraph({\n        children: [\n          new TextRun({ text: label + \' : \', bold: true, font: \'Arial\', size: 20 }),\n          new TextRun({ text: value, font: \'Arial\', size: 20 })\n        ]\n      }));\n    }\n    addField(\'Patient\', (p.prenom || \'\') + \' \' + (p.nom || \'\'));\n    addField(\'\\u00c2ge\', p.age);\n    addField(\'Profession\', p.profession);\n    addField(\'Loisirs\', p.loisirs);\n    addField(\'Date d\\\'\\u00e9valuation\', p.dateEval);\n    addField(\'Prescripteur\', p.prescripteur ? p.prescripteur + (p.datePrescription ? \' \\u2014 ordonnance du \' + p.datePrescription : \'\') : \'\');\n    addField(\'M\u00e9decin traitant\', p.mt);\n    addField(\'Motif\', p.motif);\n    children.push(new Paragraph({ children: [] }));\n\n    function htmlToParas(html) {\n      if (!html) return [];\n      var tmp = document.createElement(\'div\');\n      tmp.innerHTML = html;\n      var paras = [];\n      var nodes = tmp.childNodes;\n      for (var i = 0; i < nodes.length; i++) {\n        var node = nodes[i];\n        if (node.nodeName === \'BR\') {\n          paras.push(new Paragraph({ children: [] }));\n          continue;\n        }\n        if (node.nodeName === \'DIV\') {\n          var isIndented = node.getAttribute(\'style\') && node.getAttribute(\'style\').indexOf(\'padding-left\') !== -1;\n          var innerNodes = node.childNodes;\n          var isAllBold = node.children && node.children.length === 1 && (node.children[0].nodeName === \'STRONG\' || node.children[0].nodeName === \'B\') && node.textContent.trim() === node.children[0].textContent.trim();\n\n          if (isAllBold && node.textContent.trim().length > 0) {\n            var titleText = node.children[0].textContent.trim();\n            paras.push(new Paragraph({\n              border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: \'c0d8e0\', space: 2 } },\n              spacing: { before: 200, after: 60 },\n              keepNext: true,\n              children: [new TextRun({ text: titleText, bold: true, size: 22, font: \'Arial\', color: \'126477\' })]\n            }));\n          } else {\n            var runs = [];\n            for (var j = 0; j < innerNodes.length; j++) {\n              var child = innerNodes[j];\n              if (child.nodeType === 3) {\n                if (child.textContent) runs.push(new TextRun({ text: child.textContent, font: \'Arial\', size: 20 }));\n              } else if (child.nodeName === \'STRONG\' || child.nodeName === \'B\') {\n                if (child.textContent) runs.push(new TextRun({ text: child.textContent, bold: true, font: \'Arial\', size: 20 }));\n              } else {\n                if (child.textContent) runs.push(new TextRun({ text: child.textContent, font: \'Arial\', size: 20 }));\n              }\n            }\n            if (runs.length === 0 && node.textContent.trim()) {\n              runs.push(new TextRun({ text: node.textContent, font: \'Arial\', size: 20 }));\n            }\n            if (runs.length > 0) {\n              paras.push(new Paragraph({\n                children: runs,\n                indent: isIndented ? { left: 360 } : undefined,\n                spacing: { after: 40 }\n              }));\n            }\n          }\n        }\n      }\n      return paras;\n    }\n\n    if (p.b1CR) {\n      var b1Paras = htmlToParas(p.b1CR);\n      for (var i = 0; i < b1Paras.length; i++) children.push(b1Paras[i]);\n      children.push(new Paragraph({ children: [] }));\n    }\n\n    if (p.b2CR) {\n      children.push(new Paragraph({\n        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: \'126477\', space: 2 } },\n        spacing: { before: 200, after: 80 },\n        keepNext: true,\n        children: [new TextRun({ text: \'EXAMEN VIA R\u00c9ALIT\u00c9 VIRTUELLE\', bold: true, size: 24, font: \'Arial\', color: \'126477\' })]\n      }));\n      var b2Paras = htmlToParas(p.b2CR);\n      for (var i = 0; i < b2Paras.length; i++) children.push(b2Paras[i]);\n      children.push(new Paragraph({ children: [] }));\n    }\n\n    function addCapture(label, dataUrl) {\n      if (!dataUrl) return;\n      children.push(new Paragraph({\n        pageBreakBefore: true,\n        children: [new TextRun({ text: label, bold: true, size: 22, font: \'Arial\', color: \'126477\' })]\n      }));\n      children.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: \'c0d8e0\', space: 2 } }, children: [] }));\n      children.push(new Paragraph({ children: [] }));\n      var imgData = dataUrl.split(\',\')[1];\n      var mimeType = dataUrl.split(\';\')[0].split(\':\')[1];\n      var imgType = mimeType.indexOf(\'png\') !== -1 ? \'png\' : \'jpg\';\n      children.push(new Paragraph({\n        children: [new ImageRun({\n          data: Uint8Array.from(atob(imgData), function(c) { return c.charCodeAt(0); }),\n          transformation: { width: 500, height: 340 },\n          type: imgType\n        })]\n      }));\n    }\n\n    if (p.captureVVS || p.captureHCTSIB) {\n      children.push(new Paragraph({\n        pageBreakBefore: true,\n        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: \'126477\', space: 2 } },\n        spacing: { after: 80 },\n        children: [new TextRun({ text: \'EXAMENS GRAPHIQUES\', bold: true, size: 24, font: \'Arial\', color: \'126477\' })]\n      }));\n      addCapture(\'Verticale Visuelle Subjective (VVS)\', p.captureVVS);\n      addCapture(\'HCTSIB / Posturographie\', p.captureHCTSIB);\n    }\n\n    var doc = new Document({\n      sections: [{\n        properties: {\n          page: {\n            size: { width: 11906, height: 16838 },\n            margin: { top: 1000, right: 1000, bottom: 1400, left: 1000 }\n          }\n        },\n        footers: { default: docFooter },\n        children: children\n      }]\n    });\n\n    Packer.toBlob(doc).then(function(blob) {\n      var url = URL.createObjectURL(blob);\n      var a = document.createElement(\'a\');\n      a.href = url;\n      a.download = \'CR_\' + (p.nom || \'\') + \'_\' + (p.prenom || \'\') + \'_\' + (p.dateEval || \'bilan\') + \'.docx\';\n      a.click();\n      URL.revokeObjectURL(url);\n      p.statut = \'exporte\';\n      p.lastMod = new Date().toLocaleString(\'fr-FR\');\n      savePatients();\n      renderDashboard();\n      updateStepper(p);\n      showToast(\'Document Word g\u00e9n\u00e9r\u00e9\', \'description\');\n    });\n\n  } catch(e) {\n    console.error(e);\n    showToast(\'Erreur export : \' + e.message, \'error\');\n  }\n}';

content = content.substring(0, expPDFStart) + exportWordFn + content.substring(expPDFEnd);
check('change8c result', content.indexOf('function exportWord()'));

// ============================================================
// Write output
// ============================================================
fs.writeFileSync(filePath, content, 'utf8');
console.log('\nDONE - All changes applied successfully');
console.log('File size before:', original.length, '-> after:', content.length);
