const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../brand-intro.js'), 'utf8');

function target() {
  const listeners = new Map();
  return {
    addEventListener(name, fn) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(fn);
    },
    removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
    emit(name, event = {}) { [...(listeners.get(name) || [])].forEach(fn => fn(event)); },
    listenerCount() { return [...listeners.values()].reduce((sum, set) => sum + set.size, 0); }
  };
}

function setup(options = {}) {
  const timers = new Map();
  let nextTimer = 0;
  const intro = Object.assign(target(), {
    hidden: true, connected: false,
    classList: { add() {} },
    remove() { this.connected = false; }
  });
  const motion = Object.assign(target(), { matches: !!options.reduced });
  if (options.legacyMotion) {
    motion.addListener = fn => motion.addEventListenerOriginal('change', fn);
    motion.removeListener = fn => motion.removeEventListenerOriginal('change', fn);
    motion.addEventListenerOriginal = motion.addEventListener;
    motion.removeEventListenerOriginal = motion.removeEventListener;
    delete motion.addEventListener;
    delete motion.removeEventListener;
  }
  const template = {
    dataset: { enabled: options.disabled ? 'false' : 'true' },
    content: { firstElementChild: { cloneNode() { return intro; } } }
  };
  const document = Object.assign(target(), {
    readyState: options.readyState || 'interactive',
    hidden: !!options.hidden,
    querySelector(selector) {
      if (selector === '[data-brand-intro-styles]') return { sheet: options.lateStyles ? null : {}, media: 'print' };
      return options.noTemplate ? null : template;
    },
    body: { appendChild(node) { node.connected = true; } }
  });
  const performance = { getEntriesByType() { return options.painted ? [{ name: 'first-contentful-paint' }] : []; } };
  const window = Object.assign(target(), {
    performance, scrollY: options.scrollY || 0, location: { hash: options.hash || '' },
    matchMedia() { return motion; },
    getComputedStyle() {
      if (options.styleThrows) throw new Error('Style not available');
      return Object.assign({ animationName: 'brand-intro-exit', animationDuration: '2.05s', animationPlayState: 'running', display: 'grid' }, options.style);
    }
  });
  const sandbox = {
    document, window, performance,
    setTimeout(fn, delay) { const id = ++nextTimer; timers.set(id, { fn, delay }); return id; },
    clearTimeout(id) { timers.delete(id); }
  };
  vm.runInNewContext(source, sandbox, { filename: 'brand-intro.js' });
  return { intro, timers, document, window, motion };
}

function assertClean(state) {
  assert.equal(state.intro.connected, false);
  assert.equal(state.intro.hidden, true);
  assert.equal(state.timers.size, 0);
  for (const obj of [state.intro, state.document, state.window, state.motion]) {
    assert.equal(obj.listenerCount(), 0, 'Every registered listener must be removed');
  }
}

test('Starts without touching page styles and registers the 2500ms watchdog', () => {
  const state = setup();
  assert.equal(state.intro.connected, true);
  assert.equal(state.intro.hidden, false);
  assert.equal([...state.timers.values()][0].delay, 2500);
  assert.deepEqual(Object.keys(state.document.body), ['appendChild']);
});

test('Child animation events do not end the intro; root completion cleans up', () => {
  const state = setup();
  state.intro.emit('animationend', { target: {}, animationName: 'brand-intro-model' });
  assert.equal(state.intro.connected, true);
  state.intro.emit('animationend', { target: state.intro, animationName: 'brand-intro-exit' });
  assertClean(state);
});

test('Missing animation events still destroy the overlay via the watchdog', () => {
  const state = setup();
  const timeout = [...state.timers.values()][0];
  timeout.fn();
  timeout.fn();
  assertClean(state);
});

test('Animation cancellation destroys the overlay', () => {
  const state = setup();
  state.intro.emit('animationcancel', { target: state.intro, animationName: 'brand-intro-exit' });
  assertClean(state);
});

for (const [label, options] of Object.entries({
  'missing template': { noTemplate: true },
  'disabled component': { disabled: true },
  'reduced motion': { reduced: true },
  'background page': { hidden: true },
  'late script': { readyState: 'complete' },
  'restored scroll': { scrollY: 120 },
  'deep link': { hash: '#flavours' }
})) {
  test('Skips safely: ' + label, () => assertClean(setup(options)));
}

test('External stylesheet readiness cannot disable the embedded intro', () => {
  assert.equal(setup({ lateStyles: true }).intro.connected, true);
});

test('A paint timing entry does not suppress a normal initial intro', () => {
  assert.equal(setup({ painted: true }).intro.connected, true);
});

test('Published HTML embeds the exact current component sources', () => {
  const { renderIntro } = require('../scripts/build-intro.cjs');
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.equal(renderIntro(html), html);
  assert.equal(renderIntro(renderIntro(html)), html, 'Build must be idempotent');
  assert.doesNotMatch(html, /(?:src|href)="\.\/brand-intro\.(?:js|css)"/);
  assert.ok(html.indexOf('data-brand-intro-controller') < html.indexOf('<!-- 导航栏 -->'));
});

for (const [label, style] of Object.entries({
  'missing CSS': { animationName: 'none' },
  'paused animation': { animationPlayState: 'paused' },
  'disabled animation': { animationDuration: '0s' },
  'hidden overlay': { display: 'none' },
  'invalid duration': { animationDuration: '' }
})) {
  test('Unavailable animation exits immediately: ' + label, () => assertClean(setup({ style })));
}

test('Style evaluation errors cannot strand the overlay', () => assertClean(setup({ styleThrows: true })));

for (const event of ['pointerdown', 'touchstart', 'wheel', 'keydown', 'pagehide']) {
  test('User interaction or page departure dismisses safely: ' + event, () => {
    const state = setup();
    state.window.emit(event);
    assertClean(state);
  });
}

test('Switching to a background tab cleans up without waiting for animation frames', () => {
  const state = setup();
  state.document.hidden = true;
  state.document.emit('visibilitychange');
  assertClean(state);
});

for (const legacyMotion of [false, true]) {
  test('Live reduced-motion change dismisses safely; legacy=' + legacyMotion, () => {
    const state = setup({ legacyMotion });
    state.motion.emit('change', { matches: true });
    assertClean(state);
  });
}
