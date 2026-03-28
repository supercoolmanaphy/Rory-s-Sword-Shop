(function () {
  // Resolve the image path relative to this script's location
  var scriptSrc = (document.currentScript && document.currentScript.src) || '';
  var base = scriptSrc.replace(/cursor\.js$/, '');
  var imgSrc = base + 'images/cursor-sword.svg';

  // Inject styles: CSS cursor URL (browser-native, always visible) + slash animation.
  // The HTML pages already carry the cursor URL in their <style> at parse-time to avoid
  // a flash of the default cursor; this injection overrides with an absolute URL derived
  // from the script's own src, which is more reliable if the page is served from a
  // subdirectory or the files are reorganised.
  var style = document.createElement('style');
  style.textContent = [
    '* { cursor: url("' + imgSrc + '") 5 5, auto !important; }',

    '.sword-slash {',
    '  position: fixed;',
    '  pointer-events: none;',
    '  z-index: 999998;',
    '  overflow: visible;',
    '}',

    '.slash-line {',
    '  stroke-dasharray: 120;',
    '  stroke-dashoffset: 120;',
    '  animation: slashDraw 0.35s cubic-bezier(0.2, 0.8, 0.4, 1) forwards;',
    '}',

    '.slash-line-2 {',
    '  stroke-dasharray: 120;',
    '  stroke-dashoffset: 120;',
    '  animation: slashDraw 0.35s cubic-bezier(0.2, 0.8, 0.4, 1) 0.05s forwards;',
    '}',

    '@keyframes slashDraw {',
    '  0%   { stroke-dashoffset: 120; opacity: 1; }',
    '  55%  { stroke-dashoffset: 0;   opacity: 1; }',
    '  100% { stroke-dashoffset: -15; opacity: 0; }',
    '}',

    '.slash-container {',
    '  animation: slashFade 0.42s ease-out forwards;',
    '}',

    '@keyframes slashFade {',
    '  0%   { opacity: 1; transform: scale(1); }',
    '  70%  { opacity: 1; transform: scale(1.08); }',
    '  100% { opacity: 0; transform: scale(1.15); }',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // Slash counter for unique filter IDs
  var slashCount = 0;

  function createSlash(x, y) {
    var id = 'slashGlow-' + (++slashCount);
    var size = 70;
    var half = size / 2;
    var ns = 'http://www.w3.org/2000/svg';

    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'sword-slash');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.style.left = (x - half) + 'px';
    svg.style.top  = (y - half) + 'px';

    // Glow filter — use slashCount-based ID (no Date.now() race)
    var defs   = document.createElementNS(ns, 'defs');
    var filter = document.createElementNS(ns, 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    var feBlur  = document.createElementNS(ns, 'feGaussianBlur');
    feBlur.setAttribute('stdDeviation', '3');
    feBlur.setAttribute('result', 'blur');
    var feMerge = document.createElementNS(ns, 'feMerge');
    var node1   = document.createElementNS(ns, 'feMergeNode');
    node1.setAttribute('in', 'blur');
    var node2   = document.createElementNS(ns, 'feMergeNode');
    node2.setAttribute('in', 'SourceGraphic');
    feMerge.appendChild(node1);
    feMerge.appendChild(node2);
    filter.appendChild(feBlur);
    filter.appendChild(feMerge);
    defs.appendChild(filter);
    svg.appendChild(defs);

    var glowRef = 'url(#' + id + ')';
    var pad = 10;

    var g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'slash-container');

    // Line 1: top-left → bottom-right  (\)
    var line1 = document.createElementNS(ns, 'line');
    line1.setAttribute('x1', pad);
    line1.setAttribute('y1', pad);
    line1.setAttribute('x2', size - pad);
    line1.setAttribute('y2', size - pad);
    line1.setAttribute('stroke', 'rgba(255,255,255,0.95)');
    line1.setAttribute('stroke-width', '3');
    line1.setAttribute('stroke-linecap', 'round');
    line1.setAttribute('filter', glowRef);
    line1.setAttribute('class', 'slash-line');

    // Line 2: top-right → bottom-left  (/)
    var line2 = document.createElementNS(ns, 'line');
    line2.setAttribute('x1', size - pad);
    line2.setAttribute('y1', pad);
    line2.setAttribute('x2', pad);
    line2.setAttribute('y2', size - pad);
    line2.setAttribute('stroke', 'rgba(220,220,255,0.9)');
    line2.setAttribute('stroke-width', '3');
    line2.setAttribute('stroke-linecap', 'round');
    line2.setAttribute('filter', glowRef);
    line2.setAttribute('class', 'slash-line-2');

    g.appendChild(line1);
    g.appendChild(line2);
    svg.appendChild(g);
    document.body.appendChild(svg);

    setTimeout(function () {
      if (svg.parentNode) { svg.parentNode.removeChild(svg); }
    }, 500);
  }

  document.addEventListener('click', function (e) { createSlash(e.clientX, e.clientY); });
})();
