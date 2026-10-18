(() => {
  const canvas = document.querySelector('#starfield');
  const ctx = canvas.getContext('2d');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width, height, cx, cy, stars = [], phase = 0, last = 0, frame = 0;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = innerWidth; height = innerHeight;
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // The celestial pole sits outside the frame, like the reference's sweeping sky.
    cx = -width * 0.12; cy = -height * 0.30;
    const radius = Math.hypot(width - cx, height - cy) * 1.05;
    let seed = 42;
    const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
    stars = Array.from({ length: Math.min(5200, Math.max(2400, width * height / 230)) }, () => ({
      radius: Math.sqrt(random()) * radius,
      angle: random() * Math.PI * 2,
      length: 0.045 + random() * 0.105,
      alpha: 0.14 + Math.pow(random(), 2) * 0.44,
      width: 0.35 + random() * 0.65,
      color: random() > 0.22 ? '215,233,255' : '178,171,249'
    }));
    paint();
  }

  function paint() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    for (const star of stars) {
      const head = star.angle + phase;
      const middle = head - star.length / 2;
      const x = cx + Math.cos(middle) * star.radius;
      const y = cy + Math.sin(middle) * star.radius;
      const margin = star.radius * star.length / 2 + 2;
      if (x < -margin || x > width + margin || y < -margin || y > height + margin) continue;
      // Each thin arc follows its own fixed radius; every star shares one angular speed.
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, star.radius, head - star.length + star.length * i / 4,
          head - star.length + star.length * (i + 1) / 4 + 0.0001);
        ctx.strokeStyle = `rgba(${star.color},${star.alpha * (i + 1) / 4})`;
        ctx.lineWidth = star.width;
        ctx.stroke();
      }
    }
    // Dim the text area without changing the sky's motion or introducing flashes.
    const shade = ctx.createLinearGradient(0, 0, width, 0);
    shade.addColorStop(0, 'rgba(2,6,17,0.18)');
    shade.addColorStop(0.52, 'rgba(2,6,17,0.02)');
    shade.addColorStop(1, 'rgba(2,6,17,0)');
    ctx.fillStyle = shade; ctx.fillRect(0, 0, width, height);
  }

  function tick(time) {
    frame = 0;
    if (document.hidden || motion.matches) { last = 0; return; }
    if (!last || time - last >= 1000 / 30) {
      phase += last ? Math.min((time - last) / 1000, 0.1) * 0.009 : 0;
      last = time;
      paint();
    }
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    cancelAnimationFrame(frame); last = 0;
    if (!motion.matches && !document.hidden) frame = requestAnimationFrame(tick);
    else paint();
  }
  addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', resume);
  motion.addEventListener('change', resume);
  resize(); resume();
})();
