// Don Patacón, propuesta de portada.
// Principio: el HTML ya es el estado final (plato real, pasos completos, ruta llena).
// Este script genera los bordes crocantes y, si hay movimiento permitido, monta la
// escena "del plátano al patacón" y la lleva del inicio al final.

(() => {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Borde crocante: misma forma en fotos, escena y secciones ----------
  // Generador con semilla para que cada forma sea irregular pero estable entre visitas.
  function rng(semilla) {
    return () => {
      semilla = (semilla + 0x6d2b79f5) | 0;
      let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Contorno de patacón: óvalo deformado en baja frecuencia (la forma aplastada)
  // más un serrucho fino irregular (el borde frito que se rompe).
  function contorno(semilla, n, serrucho) {
    const r = rng(semilla);
    const f = [r() * 6.28, r() * 6.28, r() * 6.28];
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const base = 1 + 0.05 * Math.sin(2 * a + f[0]) + 0.035 * Math.sin(3 * a + f[1]) + 0.02 * Math.sin(5 * a + f[2]);
      const m = base - serrucho * (i % 2 ? r() : 0.3 * r());
      pts.push([Math.cos(a) * m, Math.sin(a) * m]);
    }
    return pts;
  }
  const absoluto = (pts, cx, cy, rx, ry) =>
    'M' + pts.map(([x, y]) => `${(cx + x * rx).toFixed(1)} ${(cy + y * ry).toFixed(1)}`).join('L') + 'Z';

  // Fotos: clipPath en unidades de la caja, una semilla por foto.
  const defs = document.getElementById('crocantes');
  document.querySelectorAll('.crocante').forEach((el) => {
    const k = el.dataset.crocante || '0';
    const cp = document.createElementNS(SVGNS, 'clipPath');
    cp.id = 'crocante-' + k;
    cp.setAttribute('clipPathUnits', 'objectBoundingBox');
    const p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', absoluto(contorno(Number(k) * 97 + 11, 72, 0.055), 0.5, 0.5, 0.47, 0.47));
    cp.appendChild(p);
    defs.appendChild(cp);
    el.style.clipPath = `url(#crocante-${k})`;
  });
  document.documentElement.classList.add('js-crocante');

  // Borde superior mordido de la franja oscura.
  const casa = document.querySelector('.casa');
  if (casa) {
    const r = rng(7);
    const pts = [];
    for (let x = 0; x <= 100; x += 2) pts.push(`${x}% ${(0.6 + r() * 1.8).toFixed(2)}%`);
    casa.style.clipPath = `polygon(${pts.join(',')},100% 100%,0 100%)`;
  }

  // Formas de la escena.
  const $ = (s) => document.querySelector(s);
  $('#e-aura').setAttribute('d', absoluto(contorno(3, 60, 0.04), 300, 320, 262, 232));
  $('#e-disco').setAttribute('d', absoluto(contorno(21, 56, 0.07), 300, 336, 150, 100));
  const plato = absoluto(contorno(5, 80, 0.035), 300, 320, 228, 148);
  $('#e-plato-borde').setAttribute('d', plato);
  $('#e-plato-contorno').setAttribute('d', plato);

  // Migas que saltan con el crunch.
  const migas = $('#e-migas');
  const rm = rng(42);
  for (let i = 0; i < 16; i++) {
    const p = document.createElementNS(SVGNS, 'path');
    const s = 6 + rm() * 9;
    p.setAttribute('d', absoluto(contorno(100 + i, 7, 0.35), 300, 330, s, s * 0.8));
    const ang = (i / 16) * Math.PI * 2 + rm() * 0.4;
    p.dataset.dx = String(Math.cos(ang) * (150 + rm() * 110));
    p.dataset.dy = String(Math.sin(ang) * (110 + rm() * 80) - 40);
    migas.appendChild(p);
  }

  if (!window.gsap || reducido) return; // sin GSAP o con movimiento reducido: todo queda en el estado final
  gsap.registerPlugin(ScrollTrigger);

  // ---------- Mascota en línea para poder animar ojos, brazo y sombrero ----------
  let mascota = null;
  const listaMascota = fetch('mascota.svg')
    .then((r) => r.text())
    .then((txt) => {
      document.querySelectorAll('[data-mascota]').forEach((cont) => (cont.innerHTML = txt));
      mascota = document.querySelector('[data-mascota] svg');
      const ojos = mascota.querySelector('#m-ojos');
      gsap.timeline({ repeat: -1, repeatDelay: 2.6 })
        .to(ojos, { scaleY: 0.1, transformOrigin: '50% 50%', duration: 0.08 })
        .to(ojos, { scaleY: 1, duration: 0.1 });
    })
    .catch(() => {});

  function saludar() {
    if (!mascota) return;
    gsap.timeline()
      .to(mascota.querySelector('#m-brazo'), { rotation: -22, svgOrigin: '128 182', duration: 0.18 })
      .to(mascota.querySelector('#m-brazo'), { rotation: 12, svgOrigin: '128 182', duration: 0.18, repeat: 2, yoyo: true })
      .to(mascota.querySelector('#m-brazo'), { rotation: 0, svgOrigin: '128 182', duration: 0.2 });
  }
  function brincar() {
    if (!mascota) return;
    gsap.fromTo(mascota, { y: 0 }, { y: -14, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' });
    gsap.fromTo(mascota.querySelector('#m-sombrero'), { y: 0 }, { y: -10, duration: 0.14, yoyo: true, repeat: 1, delay: 0.04 });
  }

  // ---------- Escena: del plátano al patacón ----------
  const GLOBOS = [
    'Primero, un plátano bien verde.',
    'Al aceite, que se dore un poquito.',
    'Ahora, ¡a la pataconera!',
    'Otra vez al aceite. ¡Escucha cómo cruje!',
    'Así de crujiente te espera en el 3-48.',
  ];
  const CORTES = [1.8, 3.6, 6.2, 8.4]; // tiempos de la línea en que cambia el paso
  const pasos = [...document.querySelectorAll('.pasos li')];
  const globo = $('#globo-texto');
  let pasoActual = -1;

  function marcarPaso(t) {
    let k = CORTES.findIndex((c) => t < c);
    if (k === -1) k = 4;
    if (k === pasoActual) return;
    pasoActual = k;
    pasos.forEach((li, i) => {
      li.classList.toggle('actual', i === k);
      li.classList.toggle('hecho', i < k);
    });
    globo.textContent = GLOBOS[k];
    brincar();
    if (k === 3 || k === 4) saludar();
  }

  function armarLinea(tl) {
    const burbujas = gsap.utils.toArray('#e-burbujas circle');
    const listaMigas = gsap.utils.toArray('#e-migas path');

    // Estado inicial (lo fija el script, no el HTML).
    gsap.set('#e-platano', { opacity: 1, scale: 1, svgOrigin: '300 170' });
    gsap.set('#e-cuchillo', { opacity: 1, y: -60 });
    gsap.set('#e-tajada', { opacity: 0, y: -140, scaleX: 1, scaleY: 1, svgOrigin: '300 362' });
    gsap.set('#e-tajada-pulpa', { fill: '#F6EBB5' });
    gsap.set('#e-burbujas', { opacity: 0 });
    gsap.set('#e-prensa', { opacity: 0 });
    gsap.set('#e-tapa', { rotation: -48, y: 0, svgOrigin: '156 311' });
    gsap.set('#e-patacon', { opacity: 0, scale: 0.6, x: 0, svgOrigin: '300 336' });
    gsap.set('#e-disco', { fill: '#F2D27A' });
    gsap.set('#e-crunch', { opacity: 0, scale: 0.3, rotation: -10, svgOrigin: '300 180' });
    gsap.set(listaMigas, { opacity: 0, x: 0, y: 0 });
    gsap.set('#e-plato', { opacity: 0, scale: 0.86, svgOrigin: '300 320' });

    tl
      // 1. Cortar
      .to('#e-cuchillo', { y: 70, duration: 0.8, ease: 'power2.in' }, 0)
      .to('#e-platano', { opacity: 0, scale: 0.8, duration: 0.5 }, 0.75)
      .to('#e-cuchillo', { opacity: 0, duration: 0.3 }, 0.8)
      .to('#e-tajada', { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.8)' }, 1.0)
      // 2. Primera fritura: sube el burbujeo y la pulpa se dora apenas
      .to('#e-burbujas', { opacity: 1, duration: 0.3 }, 1.8)
      .fromTo(burbujas, { y: 0 }, { y: -50, duration: 1.2, stagger: 0.05, ease: 'none' }, 1.8)
      .to('#e-tajada-pulpa', { fill: '#F0D488', duration: 1.2 }, 1.9)
      .to('#e-burbujas', { opacity: 0, duration: 0.3 }, 3.2)
      // 3. Pataconera: la tapa baja y aplasta la tajada
      .to('#e-prensa', { opacity: 1, duration: 0.3 }, 3.6)
      .to('#e-tapa', { rotation: 0, y: 16, duration: 0.8, ease: 'power3.in' }, 3.8)
      .to('#e-tajada', { scaleY: 0.32, scaleX: 1.5, duration: 0.35, ease: 'power2.out' }, 4.45)
      .to('#e-tapa', { rotation: -48, y: 0, duration: 0.6, ease: 'power2.out' }, 4.95)
      .to('#e-prensa', { opacity: 0, duration: 0.4 }, 5.35)
      .to('#e-tajada', { opacity: 0, duration: 0.3 }, 5.5)
      .to('#e-patacon', { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, 5.5)
      // 4. Segunda fritura: dorado, crunch y migas
      .to('#e-burbujas', { opacity: 1, duration: 0.3 }, 6.2)
      .fromTo(burbujas, { y: 20 }, { y: -40, duration: 1.1, stagger: 0.04, ease: 'none' }, 6.2)
      .to('#e-disco', { fill: '#F5B41F', duration: 0.6 }, 6.3)
      .to('#e-disco', { fill: '#E39A1F', duration: 0.6 }, 6.9)
      .to('#e-burbujas', { opacity: 0, duration: 0.3 }, 7.3)
      .to('#e-crunch', { opacity: 1, scale: 1, rotation: -6, duration: 0.4, ease: 'back.out(2.5)' }, 7.3)
      .to('#e-patacon', { x: 5, duration: 0.05, repeat: 5, yoyo: true }, 7.3)
      .to(listaMigas, {
        opacity: 1, duration: 0.15,
      }, 7.35)
      .to(listaMigas, {
        x: (i, el) => Number(el.dataset.dx), y: (i, el) => Number(el.dataset.dy),
        rotation: () => gsap.utils.random(-180, 180), duration: 0.9, ease: 'power2.out',
      }, 7.35)
      .to(listaMigas, { opacity: 0, duration: 0.3 }, 8.0)
      // Final: el patacón se vuelve el plato real
      .to('#e-crunch', { opacity: 0, y: -30, duration: 0.4 }, 8.4)
      .to('#e-patacon', { opacity: 0, scale: 1.15, duration: 0.6 }, 8.5)
      .to('#e-plato', { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }, 8.5)
      .to({}, { duration: 0.7 }); // respiro al final antes de soltar la sección
    return tl;
  }

  document.documentElement.classList.add('js-escena');
  const listaPasos = document.querySelector('.pasos');
  const mm = gsap.matchMedia();

  // Escritorio: la portada se fija y el scroll recorre la receta.
  mm.add('(min-width: 901px)', () => {
    listaPasos.classList.add('pasos--vivo');
    const tl = gsap.timeline({
      defaults: { ease: 'power1.inOut' },
      scrollTrigger: {
        trigger: '.portada', start: 'top top', end: '+=2400', pin: true, scrub: 0.6,
        onUpdate: (st) => marcarPaso(st.animation ? st.animation.time() : 0),
      },
    });
    armarLinea(tl);
    marcarPaso(0);
    return () => { listaPasos.classList.remove('pasos--vivo'); pasoActual = -1; };
  });

  // Celular: nada fijado. La receta corre sola al verse la escena, y se puede repetir.
  mm.add('(max-width: 900px)', () => {
    listaPasos.classList.add('pasos--vivo');
    const repetir = $('.repetir');
    const tl = gsap.timeline({
      paused: true, defaults: { ease: 'power1.inOut' },
      onUpdate: () => marcarPaso(tl.time()),
      onComplete: () => { repetir.hidden = false; },
    });
    armarLinea(tl);
    tl.timeScale(1.25);
    marcarPaso(0);
    let visto = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !visto) { visto = true; listaMascota.then(() => tl.play()); }
      else if (!e.isIntersecting && visto && tl.isActive()) tl.pause();
      else if (e.isIntersecting && visto && tl.paused() && tl.progress() < 1) tl.play();
    }, { threshold: 0.45 });
    io.observe($('.portada__escena'));
    const otraVez = () => { repetir.hidden = true; tl.restart(); };
    repetir.addEventListener('click', otraVez);
    return () => { io.disconnect(); repetir.removeEventListener('click', otraVez); listaPasos.classList.remove('pasos--vivo'); pasoActual = -1; };
  });

  // ---------- Hojas que se apartan del cursor ----------
  if (matchMedia('(pointer: fine)').matches) {
    const portada = $('.portada');
    const hojas = gsap.utils.toArray('.portada .hoja-deco').map((el) => ({
      el, prof: Number(el.dataset.prof || 1),
      x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3.out' }),
    }));
    portada.addEventListener('pointermove', (ev) => {
      hojas.forEach((h) => {
        const b = h.el.getBoundingClientRect();
        const dx = b.left + b.width / 2 - gsap.getProperty(h.el, 'x') - ev.clientX;
        const dy = b.top + b.height / 2 - gsap.getProperty(h.el, 'y') - ev.clientY;
        const d = Math.hypot(dx, dy) || 1;
        const fuerza = Math.max(0, 360 - d) / 360;
        h.x((dx / d) * 60 * fuerza * h.prof);
        h.y((dy / d) * 40 * fuerza * h.prof);
      });
    });
    portada.addEventListener('pointerleave', () => hojas.forEach((h) => { h.x(0); h.y(0); }));
  }

  // ---------- Favoritos: cada plato cae en la tabla y le pegan el precio ----------
  gsap.utils.toArray('.plato').forEach((plato, i) => {
    const foto = plato.querySelector('.plato__foto');
    const precio = plato.querySelector('.precio');
    gsap.set(foto, { scale: 0.7, rotation: i % 2 ? 8 : -8, opacity: 0 });
    gsap.set(precio, { scale: 0, rotation: -20 });
    gsap.timeline({ scrollTrigger: { trigger: plato, start: 'top 82%', toggleActions: 'play none none none' } })
      .to(foto, { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.5)', clearProps: 'transform,opacity' })
      .to(precio, { scale: 1, rotation: -3, duration: 0.4, ease: 'back.out(3)' }, '-=0.25');
  });

  // ---------- Cómo llegar: la mascota baja por la ruta con el scroll ----------
  const ruta = $('.ruta');
  const cabeza = $('.ruta__cabeza');
  if (ruta && cabeza) {
    document.documentElement.classList.add('js-ruta');
    cabeza.style.bottom = 'auto';
    cabeza.style.top = '-.4rem';
    const st = { trigger: ruta, start: 'top 70%', end: 'bottom 55%', scrub: 0.5, invalidateOnRefresh: true };
    gsap.fromTo('.ruta__avance', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: st });
    gsap.fromTo(cabeza, { y: 0 }, { y: () => ruta.offsetHeight - cabeza.offsetHeight + 4, ease: 'none', scrollTrigger: { ...st } });
  }

  document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
