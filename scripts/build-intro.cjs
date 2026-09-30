// Keep component sources separate; deliver their small payload with the HTML.
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'index.html');

function renderIntro(html) {
  const newline = html.includes('\r\n') ? '\r\n' : '\n';
  let output = html.replace(/\r\n/g, '\n');
  const blocks = [
    { name: 'styles', file: 'brand-intro.css', tag: 'style', attributes: ' data-brand-intro-styles' },
    { name: 'script', file: 'brand-intro.js', tag: 'script', attributes: ' data-brand-intro-controller' }
  ];

  for (const { name, file, tag, attributes } of blocks) {
    const start = '    <!-- brand-intro:' + name + ':start -->';
    const end = '    <!-- brand-intro:' + name + ':end -->';
    const from = output.indexOf(start);
    const to = output.indexOf(end, from);
    if (from < 0 || to < 0) throw new Error('Missing intro markers: ' + name);

    const source = fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n').trimEnd();
    if (new RegExp('</' + tag, 'i').test(source)) throw new Error('Unsafe inline closing tag in ' + file);
    const content = source.split('\n').map(line => line ? '      ' + line : '').join('\n');
    const block = start + '\n    <' + tag + attributes + '>\n' + content + '\n    </' + tag + '>\n' + end;
    output = output.slice(0, from) + block + output.slice(to + end.length);
  }

  return output.replace(/\n/g, newline);
}

if (require.main === module) {
  const current = fs.readFileSync(htmlPath, 'utf8');
  const generated = renderIntro(current);
  if (process.argv.includes('--check')) {
    if (generated !== current) {
      console.error('Intro embed is stale. Run: node scripts/build-intro.cjs');
      process.exitCode = 1;
    } else console.log('Intro embed matches component sources.');
  } else if (generated !== current) {
    fs.writeFileSync(htmlPath, generated, 'utf8');
    console.log('Updated intro embed in index.html.');
  } else console.log('Intro embed already up to date.');
}

module.exports = { renderIntro };
