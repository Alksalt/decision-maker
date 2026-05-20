const REEL_TRACK_ID = 'reel-track';
const REEL_STAGE_ID = 'reel-stage';
const ITEM_HEIGHT_PX = 80;
const TOTAL_SPINS = 28;
const DURATION_MS = 1800;

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function buildCell(label: string): HTMLDivElement {
  const cell = document.createElement('div');
  cell.className = 'reel-cell';
  cell.textContent = label;
  return cell;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function buzz(): void {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(40); } catch { /* unsupported */ }
  }
}

export function animateReel(targetLabel: string, allLabels: string[]): Promise<void> {
  const stage = document.getElementById(REEL_STAGE_ID);
  const track = document.getElementById(REEL_TRACK_ID);
  if (!stage || !track) {
    return Promise.reject(new Error('Reel DOM not found'));
  }

  const labels = allLabels.length > 0 ? allLabels : [targetLabel];

  track.replaceChildren();
  for (let i = 0; i < TOTAL_SPINS; i++) {
    track.appendChild(buildCell(labels[i % labels.length]));
  }
  track.appendChild(buildCell(targetLabel));

  stage.classList.remove('hidden');
  stage.setAttribute('aria-hidden', 'false');

  const totalCells = TOTAL_SPINS + 1;
  const finalOffset = totalCells * ITEM_HEIGHT_PX - ITEM_HEIGHT_PX;

  const trackEl = track;

  if (prefersReducedMotion()) {
    trackEl.style.transform = `translateY(-${finalOffset}px)`;
    return Promise.resolve();
  }

  trackEl.style.transform = 'translateY(0)';
  return new Promise(resolve => {
    const start = performance.now();
    function frame(now: number): void {
      const t = Math.min(1, (now - start) / DURATION_MS);
      const offset = easeOutQuart(t) * finalOffset;
      trackEl.style.transform = `translateY(-${offset}px)`;
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        buzz();
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

export function hideReel(): void {
  const stage = document.getElementById(REEL_STAGE_ID);
  if (stage) {
    stage.classList.add('hidden');
    stage.setAttribute('aria-hidden', 'true');
  }
}
