/* Audio-driven playback visualization. No synthetic signal or diagnostic score. */
(() => {
  const players = new Map();
  let context;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const copy = (en, ar) => document.documentElement.lang === 'ar' ? ar : en;
  const clock = n => Number.isFinite(n) ? `${Math.floor(n / 60).toString().padStart(2, '0')}:${Math.floor(n % 60).toString().padStart(2, '0')}` : '--:--';
  function attach(audio) {
    if (players.has(audio)) return;
    const panel = document.createElement('section');
    panel.className = 'playback-signal';
    const head = document.createElement('div'); head.className = 'playback-signal-head';
    const title = document.createElement('strong'), time = document.createElement('span');
    head.append(title, time);
    const canvas = document.createElement('canvas'); canvas.width = 900; canvas.height = 180;
    canvas.setAttribute('role', 'img');
    const progress = document.createElement('progress'); progress.max = 1;
    const foot = document.createElement('div'); foot.className = 'playback-signal-foot';
    const state = document.createElement('span'), toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'text-button';
    foot.append(state, toggle); panel.append(head, canvas, progress, foot);
    audio.after(panel);
    let source, analyser, data, frame = 0, frozen = reduced.matches, lastPaint = 0, failed = false;
    const ctx = canvas.getContext('2d');
    function labels() {
      title.textContent = copy('Sound in motion', 'الموجة أثناء الاستماع');
      canvas.setAttribute('aria-label', copy('Waveform of the audio being played; digital amplitude, not blood flow', 'موجة الصوت المشغّل؛ سعة رقمية وليست تدفق الدم'));
      progress.setAttribute('aria-label', copy('Recording playback progress', 'تقدم تشغيل التسجيل'));
      toggle.textContent = frozen ? copy('Resume waveform', 'تحريك الموجة') : copy('Freeze waveform', 'تثبيت الموجة');
      toggle.setAttribute('aria-pressed', String(frozen));
      update();
    }
    function update() {
      time.textContent = `${clock(audio.currentTime)} / ${clock(audio.duration)}`;
      progress.value = audio.duration > 0 ? audio.currentTime / audio.duration : 0;
      state.textContent = failed ? copy('Waveform unavailable · audio controls remain available', 'الموجة غير متاحة · تحكم بالصوت عبر المشغّل') : audio.ended ? copy('Playback complete', 'انتهى التشغيل') : audio.paused ? copy('Paused · press play to listen', 'متوقف · اضغط التشغيل للاستماع') : frozen ? copy('Playing · waveform frozen', 'الصوت يعمل · الموجة ثابتة') : copy('Playing · synchronized with audio', 'تشغيل · متزامن مع الصوت');
    }
    function draw() {
      const dark = document.documentElement.dataset.theme === 'dark';
      ctx.fillStyle = dark ? '#101827' : '#102c29'; ctx.fillRect(0, 0, 900, 180);
      ctx.strokeStyle = dark ? '#293b55' : '#24433e'; ctx.lineWidth = 1;
      for (let x = 0; x < 900; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 180); ctx.stroke(); }
      for (let y = 30; y < 180; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(900, y); ctx.stroke(); }
      ctx.strokeStyle = dark ? '#f2b766' : '#9ce3c9'; ctx.lineWidth = 2; ctx.beginPath();
      if (analyser && !failed) {
        analyser.getFloatTimeDomainData(data);
        for (let i = 0; i < data.length; i++) { const x = i / (data.length - 1) * 900, y = 90 - data[i] * 80; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      } else { ctx.moveTo(0, 90); ctx.lineTo(900, 90); }
      ctx.stroke();
    }
    function stop() { cancelAnimationFrame(frame); frame = 0; update(); }
    function tick(now) {
      if (audio.paused || audio.ended || !audio.isConnected || audio.closest('[hidden]')) { if (!audio.paused) audio.pause(); stop(); return; }
      if (now - lastPaint >= 32) { if (!frozen) draw(); update(); lastPaint = now; }
      frame = requestAnimationFrame(tick);
    }
    async function play() {
      for (const other of players.keys()) if (other !== audio && !other.paused) other.pause();
      try {
        context ||= new (window.AudioContext || window.webkitAudioContext)();
        if (!source) {
          source = context.createMediaElementSource(audio);
          // Keep audio output independent of the visualization branch.
          source.connect(context.destination);
          analyser = context.createAnalyser(); analyser.fftSize = 2048;
          source.connect(analyser); data = new Float32Array(analyser.fftSize);
        }
        await context.resume();
      } catch { failed = true; }
      stop(); if (!audio.paused && audio.isConnected) frame = requestAnimationFrame(tick);
    }
    toggle.onclick = () => { frozen = !frozen; labels(); };
    for (const event of ['timeupdate', 'loadedmetadata', 'durationchange', 'seeking', 'seeked', 'waiting', 'error']) audio.addEventListener(event, update);
    audio.addEventListener('play', play); audio.addEventListener('pause', stop); audio.addEventListener('ended', stop);
    players.set(audio, { labels, draw, dispose() { audio.pause(); stop(); source?.disconnect(); analyser?.disconnect(); panel.remove(); } });
    labels(); draw();
  }
  function scan() {
    for (const [audio, player] of players) {
      if (!audio.isConnected) { player.dispose(); players.delete(audio); }
      else if (audio.closest('[hidden]') && !audio.paused) audio.pause();
    }
    document.querySelectorAll('audio').forEach(attach);
  }
  new MutationObserver(records => { if (records.some(r => r.addedNodes.length || r.removedNodes.length || r.attributeName === 'hidden')) scan(); }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  new MutationObserver(() => players.forEach(p => p.labels())).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  new MutationObserver(() => players.forEach(p => p.draw())).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('visibilitychange', () => { if (document.hidden) players.forEach((p, audio) => audio.pause()); });
  scan();
})();
