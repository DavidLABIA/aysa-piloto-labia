const fs = require('fs');

const args = process.argv.slice(2);
const inFile = args[0] || 'arquitectura-labia-aysa.md';
const outFile = args[1] || 'arquitectura-labia-aysa.html';
const docTitle = args[2] || 'Arquitectura labIA — Aysa';

const src = fs.readFileSync(inFile, 'utf8');

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function mdInline(text) {
  let t = esc(text);
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  return t;
}
function renderBlockquote(lines) {
  const paras = [];
  let cur = [];
  for (const l of lines) {
    if (l.trim() === '') { if (cur.length) { paras.push(cur.join('<br>')); cur = []; } }
    else cur.push(mdInline(l.trim()));
  }
  if (cur.length) paras.push(cur.join('<br>'));
  return '<blockquote>' + paras.map(p => '<p>' + p + '</p>').join('') + '</blockquote>';
}
function renderList(items, ordered) {
  const tag = ordered ? 'ol' : 'ul';
  return '<' + tag + '>' + items.map(i => '<li>' + mdInline(i) + '</li>').join('') + '</' + tag + '>';
}
function renderTable(rows) {
  const header = rows[0].map(c => '<th>' + mdInline(c) + '</th>').join('');
  const body = rows.slice(1).map(r => '<tr>' + r.map(c => '<td>' + mdInline(c) + '</td>').join('') + '</tr>').join('');
  return '<div class="tblwrap"><table><thead><tr>' + header + '</tr></thead><tbody>' + body + '</tbody></table></div>';
}

const lines = src.split('\n');
const html = [];
let i = 0;
let inBlockquote = false, bqLines = [];
let listType = null, listItems = [];
let isTable = false, tableRows = [];
let inCode = false, codeLines = [];

function flushList() { if (listType) { html.push(renderList(listItems, listType === 'ol')); listType = null; listItems = []; } }
function flushBlockquote() { if (inBlockquote) { html.push(renderBlockquote(bqLines)); inBlockquote = false; bqLines = []; } }
function flushTable() { if (isTable) { html.push(renderTable(tableRows)); isTable = false; tableRows = []; } }
function flushCode() { if (inCode) { html.push('<pre class="code"><code>' + codeLines.join('\n') + '</code></pre>'); inCode = false; codeLines = []; } }

while (i < lines.length) {
  const line = lines[i];
  const trimmed = line.trim();

  // fenced code
  if (/^```/.test(trimmed)) {
    flushBlockquote(); flushList(); flushTable();
    if (!inCode) { inCode = true; codeLines = []; }
    else flushCode();
    i++; continue;
  }
  if (inCode) { codeLines.push(line); i++; continue; }

  if (/^---+$/.test(trimmed)) { flushBlockquote(); flushList(); flushTable(); html.push('<hr>'); i++; continue; }

  if (/^#\s/.test(line)) {
    flushBlockquote(); flushList(); flushTable();
    html.push('<h1>' + mdInline(line.replace(/^#\s+/, '')) + '</h1>');
    i++; continue;
  }
  if (/^##\s/.test(line)) {
    flushBlockquote(); flushList(); flushTable();
    html.push('<h2>' + mdInline(line.replace(/^##\s+/, '')) + '</h2>');
    i++; continue;
  }
  if (/^###\s/.test(line)) {
    flushBlockquote(); flushList(); flushTable();
    html.push('<h3>' + mdInline(line.replace(/^###\s+/, '')) + '</h3>');
    i++; continue;
  }

  if (trimmed.startsWith('|')) {
    flushBlockquote(); flushList();
    if (!isTable) { isTable = true; tableRows = []; }
    const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
    const isSep = cells.every(c => /^:?-{2,}:?$/.test(c));
    if (isSep) { i++; continue; }
    tableRows.push(cells);
    i++; continue;
  }
  if (isTable) { flushTable(); }

  if (line.startsWith('>')) {
    flushList(); flushTable();
    if (!inBlockquote) { inBlockquote = true; bqLines = []; }
    bqLines.push(line.replace(/^>\s?/, ''));
    i++; continue;
  }
  if (inBlockquote) flushBlockquote();

  const om = trimmed.match(/^\d+\.\s+(.*)$/);
  if (om) {
    flushBlockquote(); flushTable();
    if (listType !== 'ol') { flushList(); listType = 'ol'; listItems = []; }
    listItems.push(om[1]);
    i++; continue;
  }
  const um = trimmed.match(/^[-*]\s+(.*)$/);
  if (um) {
    flushBlockquote(); flushTable();
    if (listType !== 'ul') { flushList(); listType = 'ul'; listItems = []; }
    listItems.push(um[1]);
    i++; continue;
  }
  if (listType) flushList();

  if (trimmed !== '') {
    flushBlockquote(); flushList(); flushTable();
    html.push('<p>' + mdInline(trimmed) + '</p>');
  }
  i++;
}
flushBlockquote(); flushList(); flushTable(); flushCode();

const doc = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${docTitle}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --accent:#0e7c86; --accent2:#0b4f56; --muted:#5b6b7b; --line:#e2e8ee; --soft:#f5f8fa; }
  body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
    color:#1c2733; line-height:1.62; font-size:13.5px; padding:36px 48px; max-width:920px; margin:0 auto; }
  h1 { font-size:26px; color:var(--accent); margin:0 0 4px; letter-spacing:-.5px; }
  h2 { font-size:17px; color:var(--accent2); margin:28px 0 10px; padding-bottom:6px;
    border-bottom:2px solid var(--line); page-break-after:avoid; }
  h3 { font-size:14px; color:var(--accent2); margin:18px 0 6px; }
  p { margin:0 0 10px; }
  strong { color:#0b4f56; }
  hr { border:none; border-top:1px solid var(--line); margin:22px 0; }
  blockquote { background:var(--soft); border-left:3px solid var(--accent); padding:10px 16px;
    margin:10px 0 14px; border-radius:2px; page-break-inside:avoid; }
  blockquote p { margin:0 0 7px; }
  blockquote p:last-child { margin-bottom:0; }
  code { background:#eef2f5; padding:1px 5px; border-radius:3px; font-size:.92em; color:#0b4f56;
    font-family:'SF Mono',Menlo,Consolas,monospace; }
  pre.code { background:#0f1722; color:#d7e2ef; border-radius:8px; padding:14px 18px; margin:12px 0 16px;
    overflow-x:auto; font-size:12.3px; line-height:1.5; page-break-inside:avoid; }
  pre.code code { background:transparent; padding:0; color:inherit; font-size:inherit; }
  ul, ol { margin:2px 0 12px 22px; }
  li { margin-bottom:5px; }
  li input[type=checkbox] { margin-right:6px; }
  .tblwrap { overflow-x:auto; margin:12px 0 16px; page-break-inside:avoid; }
  table { border-collapse:collapse; width:100%; font-size:12.3px; }
  th { background:#0e7c86; color:#fff; text-align:left; padding:8px 10px; font-weight:600; }
  td { border:1px solid var(--line); padding:8px 10px; vertical-align:top; }
  tr:nth-child(even) td { background:var(--soft); }
  em { color:var(--muted); }
  p strong code, li code, td code { background:#eef2f5; }
  .kicker { font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:6px; font-weight:600; }
  .clasif { display:inline-block; background:#0e7c86; color:#fff; font-size:11px; font-weight:700; letter-spacing:.5px;
    padding:4px 12px; border-radius:20px; margin-bottom:8px; }
</style>
</head>
<body>
<div class="clasif">Confidencial · Uso interno labIA · No compartir con el cliente</div>
${html.join('\n')}
</body>
</html>`;

fs.writeFileSync(outFile, doc);
console.log('OK HTML generado:', outFile, (doc.length/1024).toFixed(1)+'KB');