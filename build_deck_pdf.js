const fs = require('fs');
const src = process.argv[2] || 'deck-implementacion-aysa.html';
const out = process.argv[3] || 'deck-implementacion-aysa-print.html';
let html = fs.readFileSync(src, 'utf8');
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const css = styleMatch ? styleMatch[1] : '';
const slStart = html.indexOf('const SLIDES = [');
const slEnd = html.indexOf('\n];\n', slStart);
if (slStart === -1 || slEnd === -1) { console.error('No se localizó SLIDES en ' + src); process.exit(1); }
const slidesBlock = html.slice(slStart, slEnd + 3);
const printScript = `${slidesBlock}\nconst all = SLIDES.map(f => '<div class="slide">' + f() + '</div>');\ndocument.getElementById('print-slides').innerHTML = all.join('<div class="pagebreak"></div>');\n`;
const outHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${src.replace('.html','')} (PDF)</title>
<style>
${css}
body { --print:1; background:#06090f; margin:0; padding:0; }
html, body { height:auto; overflow:visible; }
.slide { position:relative; inset:auto; transform:none; opacity:1; pointer-events:none; width:100vw; height:100vh; padding:5.5vh 6vw; }
.slide.active { opacity:1; }
.pagebreak { break-after:page; }
.topbar, .btn, .counter, .keys, #stepper, #deck, .controls { display:none !important; }
.bgfx { position:fixed; }
@page { size:1920px 1080px; margin:0; }
@media print {
  .slide { width:1920px; height:1080px; padding:66px 110px; page-break-after:always; page-break-inside:avoid; }
  .pagebreak { display:none; height:0; overflow:hidden; }
}
@media screen {
  .slide { width:1280px; height:720px; padding:66px 77px; }
}
</style>
</head>
<body>
<div class="bgfx"><div class="glow1"></div><div class="glow2"></div></div>
<div id="print-slides"></div>
<script>${printScript}<\/script>
</body>
</html>
`;
fs.writeFileSync(out, outHtml);
console.log('OK ' + out);
