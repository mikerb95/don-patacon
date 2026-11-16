/**
 * Animación de la portada "del plátano al patacón".
 * El HTML llega en el estado final; aquí se fija el inicio y se anima hacia él.
 * Con movimiento reducido no se hace nada: queda el plato real, quieto.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const GLOBOS = [
    'Primero, un plátano bien verde.',
    'Al aceite, que se dore un poquito.',
    'Ahora, ¡a la pataconera!',
    'Otra vez al aceite. ¡Escucha cómo cruje!',
    'Así de crujiente te espera en el 3-48.',
];
/** Tiempos de la línea (en segundos) en que cambia el paso. */
const CORTES = [1.8, 3.6, 6.2, 8.4];

/** Paso de la receta según el tiempo de la línea: 0 a 3, y 4 al terminar. */
export function pasoEn(t: number): number {
    const k = CORTES.findIndex((c) => t < c);
    return k === -1 ? 4 : k;
}

export function iniciarEscena() {
    const portada = document.querySelector<HTMLElement>('.portada');
    if (!portada) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Sin plato (foto vacía en el panel) la escena no tiene final: se deja quieta.
    if (!portada.querySelector('#e-plato')) return;

    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('js-escena');

    const $ = <T extends Element = Element>(s: string) => portada.querySelector<T>(s)!;
    const mascota = $<SVGSVGElement>('[data-mascota] svg');
    const brazo = mascota?.querySelector('#m-brazo');
    const ojos = mascota?.querySelector('#m-ojos');
    const sombrero = mascota?.querySelector('#m-sombrero');
    const globo = $<HTMLElement>('[data-globo]');
    const listaPasos = $<HTMLOListElement>('.pasos');
    const pasos = [...listaPasos.querySelectorAll('li')];

    // Parpadeo de la mascota: bucle corto, independiente del scroll.
    if (ojos) {
        gsap.timeline({ repeat: -1, repeatDelay: 2.6 })
            .to(ojos, { scaleY: 0.1, transformOrigin: '50% 50%', duration: 0.08 })
            .to(ojos, { scaleY: 1, duration: 0.1 });
    }
    const saludar = () => {
        if (!brazo) return;
        gsap.timeline()
            .to(brazo, { rotation: -22, svgOrigin: '128 182', duration: 0.18 })
            .to(brazo, { rotation: 12, svgOrigin: '128 182', duration: 0.18, repeat: 2, yoyo: true })
            .to(brazo, { rotation: 0, svgOrigin: '128 182', duration: 0.2 });
    };
    const brincar = () => {
        if (!mascota) return;
        gsap.fromTo(mascota, { y: 0 }, { y: -14, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' });
        if (sombrero) gsap.fromTo(sombrero, { y: 0 }, { y: -10, duration: 0.14, yoyo: true, repeat: 1, delay: 0.04 });
    };

    let pasoActual = -1;
    const marcarPaso = (t: number) => {
        const k = pasoEn(t);
        if (k === pasoActual) return;
        pasoActual = k;
        pasos.forEach((li, i) => {
            li.classList.toggle('actual', i === k);
            li.classList.toggle('hecho', i < k);
        });
        globo.textContent = GLOBOS[k];
        brincar();
        if (k >= 3) saludar();
    };

    const armarLinea = (tl: gsap.core.Timeline) => {
        const burbujas = gsap.utils.toArray<SVGElement>('#e-burbujas circle', portada);
        const migas = gsap.utils.toArray<SVGElement>('#e-migas path', portada);

        gsap.set('#e-platano', { opacity: 1, scale: 1, svgOrigin: '300 170' });
        gsap.set('#e-cuchillo', { opacity: 1, y: -60 });
        gsap.set('#e-tajada', { opacity: 0, y: -140, scaleX: 1, scaleY: 1, svgOrigin: '300 362' });
        gsap.set('#e-tajada-pulpa', { fill: '#F6EBB5' });
        gsap.set('#e-burbujas', { opacity: 0 });
        gsap.set('#e-prensa', { opacity: 0 });
        gsap.set('#e-tapa', { rotation: -48, y: 0, svgOrigin: '156 311' });
        gsap.set('#e-patacon', { opacity: 0, scale: 0.6, x: 0, svgOrigin: '300 336' });
        gsap.set('#e-disco', { fill: '#F2D27A' });
        gsap.set('#e-crunch', { opacity: 0, scale: 0.3, rotation: -10, y: 0, svgOrigin: '300 180' });
        gsap.set(migas, { opacity: 0, x: 0, y: 0 });
        gsap.set('#e-plato', { opacity: 0, scale: 0.86, svgOrigin: '300 320' });

        tl
            // 1. Cortar
            .to('#e-cuchillo', { y: 70, duration: 0.8, ease: 'power2.in' }, 0)
            .to('#e-platano', { opacity: 0, scale: 0.8, duration: 0.5 }, 0.75)
            .to('#e-cuchillo', { opacity: 0, duration: 0.3 }, 0.8)
            .to('#e-tajada', { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.8)' }, 1.0)
            // 2. Primera fritura: burbujeo y la pulpa se dora apenas
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
            .to(migas, { opacity: 1, duration: 0.15 }, 7.35)
            .to(migas, {
                x: (_i: number, el: Element) => Number((el as SVGElement).dataset.dx),
                y: (_i: number, el: Element) => Number((el as SVGElement).dataset.dy),
                rotation: () => gsap.utils.random(-180, 180),
                duration: 0.9,
                ease: 'power2.out',
            }, 7.35)
            .to(migas, { opacity: 0, duration: 0.3 }, 8.0)
            // Final: el patacón se vuelve el plato real
            .to('#e-crunch', { opacity: 0, y: -30, duration: 0.4 }, 8.4)
            .to('#e-patacon', { opacity: 0, scale: 1.15, duration: 0.6 }, 8.5)
            .to('#e-plato', { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }, 8.5)
            .to({}, { duration: 0.7 }); // respiro antes de soltar la sección
        return tl;
    };

    const mm = gsap.matchMedia();

    // Escritorio: la portada se fija y el scroll recorre la receta.
    mm.add('(min-width: 901px)', () => {
        listaPasos.classList.add('vivo');
        const tl = gsap.timeline({
            defaults: { ease: 'power1.inOut' },
            scrollTrigger: {
                trigger: portada,
                start: 'top top',
                end: '+=2400',
                pin: true,
                scrub: 0.6,
                onUpdate: (st) => marcarPaso(st.animation ? st.animation.time() : 0),
            },
        });
        armarLinea(tl);
        marcarPaso(0);
        return () => {
            listaPasos.classList.remove('vivo');
            pasoActual = -1;
        };
    });

    // Celular: nada fijado. La receta corre sola al verse la escena y se puede repetir.
    mm.add('(max-width: 900px)', () => {
        listaPasos.classList.add('vivo');
        const repetir = $<HTMLButtonElement>('.repetir');
        const tl = gsap.timeline({
            paused: true,
            defaults: { ease: 'power1.inOut' },
            onUpdate: () => marcarPaso(tl.time()),
            onComplete: () => { repetir.hidden = false; },
        });
        armarLinea(tl);
        tl.timeScale(1.25);
        marcarPaso(0);
        let visto = false;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !visto) {
                visto = true;
                tl.play();
            } else if (!e.isIntersecting && tl.isActive()) {
                tl.pause();
            } else if (e.isIntersecting && tl.paused() && tl.progress() < 1) {
                tl.play();
            }
        }, { threshold: 0.45 });
        io.observe($('.portada__escena'));
        const otraVez = () => {
            repetir.hidden = true;
            tl.restart();
        };
        repetir.addEventListener('click', otraVez);
        return () => {
            io.disconnect();
            repetir.removeEventListener('click', otraVez);
            listaPasos.classList.remove('vivo');
            pasoActual = -1;
        };
    });

    // Hojas que se apartan del cursor (solo con ratón).
    if (matchMedia('(pointer: fine)').matches) {
        const hojas = gsap.utils.toArray<HTMLElement>('.hoja', portada).map((el) => ({
            el,
            prof: Number(el.dataset.prof || 1),
            x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3.out' }),
            y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3.out' }),
        }));
        portada.addEventListener('pointermove', (ev) => {
            hojas.forEach((h) => {
                const b = h.el.getBoundingClientRect();
                const dx = b.left + b.width / 2 - Number(gsap.getProperty(h.el, 'x')) - ev.clientX;
                const dy = b.top + b.height / 2 - Number(gsap.getProperty(h.el, 'y')) - ev.clientY;
                const d = Math.hypot(dx, dy) || 1;
                const fuerza = Math.max(0, 360 - d) / 360;
                h.x((dx / d) * 60 * fuerza * h.prof);
                h.y((dy / d) * 40 * fuerza * h.prof);
            });
        });
        portada.addEventListener('pointerleave', () => hojas.forEach((h) => { h.x(0); h.y(0); }));
    }

    document.fonts.ready.then(() => ScrollTrigger.refresh());
}
