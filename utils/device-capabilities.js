/**
 * Device Capabilities Detection - Carga adaptativa según hardware
 * Se ejecuta ANTES de cargar recursos pesados (three.js, animaciones, etc.)
 * Expone: window.DeviceTier = 'low' | 'medium' | 'high'
 *         window.DeviceCaps = { tier, ram, cores, gpu, benchmark, connection }
 */
(function () {
  'use strict';

  const CACHE_KEY = 'device-tier-cache';
  const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días

  function now() { return performance.now(); }
  function readCache() {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { tier, ts } = JSON.parse(raw);
      if (Date.now() - ts < CACHE_TTL) return tier;
    } catch (_) {}
    return null;
  }
  function writeCache(tier) {
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ tier, ts: Date.now() })); } catch (_) {}
  }

  function getGPUTier() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'unknown';
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 'basic';
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
      const s = (renderer + ' ' + vendor).toLowerCase();
      if (/intel.*uhd|intel.*hd\s+\d|amd.*vega\s+\d|adreno\s+(\d{2,3})|mali-[gt]\d{2}/.test(s)) return 'integrated';
      if (/rtx|gtx\s+\d{3,4}|radeon\s+rx|radeon\s+pro|m1|m2|m3|apple\s+gpu|adreno\s+7\d{2}|mali-g7[0-9]/.test(s)) return 'discrete';
      return 'basic';
    } catch (_) { return 'unknown'; }
  }

  function runMicroBenchmark() {
    return new Promise(resolve => {
      const frames = 60;
      let last = performance.now();
      let total = 0;
      let count = 0;
      function tick(t) {
        total += t - last;
        last = t;
        count++;
        if (count < frames) { requestAnimationFrame(tick); return; }
        const avgFrameMs = total / frames;
        let score = 'high';
        if (avgFrameMs > 16) score = 'low';
        else if (avgFrameMs > 10) score = 'medium';
        resolve({ avgFrameMs, score });
      }
      requestAnimationFrame(tick);
    });
  }

  function getConnectionTier() {
    try {
      const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!c) return 'unknown';
      const et = c.effectiveType;
      if (et === '4g') return 'fast';
      if (et === '3g') return 'medium';
      return 'slow';
    } catch (_) { return 'unknown'; }
  }

  function computeTier(ram, cores, gpu, bench, conn) {
    let score = 0;
    if (ram >= 8) score += 3;
    else if (ram >= 4) score += 2;
    else if (ram >= 2) score += 1;
    if (cores >= 8) score += 3;
    else if (cores >= 4) score += 2;
    else if (cores >= 2) score += 1;
    if (gpu === 'discrete') score += 3;
    else if (gpu === 'integrated') score += 1;
    if (bench === 'high') score += 3;
    else if (bench === 'medium') score += 1;
    if (conn === 'fast') score += 1;
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }

  async function detect() {
    const cached = readCache();
    if (cached) return cached;

    const ram = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const gpu = getGPUTier();
    const bench = await runMicroBenchmark();
    const conn = getConnectionTier();

    const tier = computeTier(ram, cores, gpu, bench.score, conn);

    window.DeviceTier = tier;
    window.DeviceCaps = { tier, ram, cores, gpu, benchmark: bench, connection: conn, userAgent: navigator.userAgent };

    writeCache(tier);
    document.documentElement.classList.add('device-tier-' + tier);

    console.log('[DeviceCaps] Tier:', tier, window.DeviceCaps);
    return tier;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detect, { once: true });
  } else {
    detect();
  }

  window.DeviceCapsAPI = { detect, readCache, writeCache };
})();
