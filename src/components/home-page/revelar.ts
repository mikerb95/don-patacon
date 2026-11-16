/**
 * Movimiento de las secciones del inicio. Cada sección tiene un solo gesto:
 * los platos caen en la tabla y les pegan el precio; Don Patacón baja por la
 * ruta para llegar al local. Con movimiento reducido no se anima nada.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function revelarPlatos() {
    if (reducido()) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray<HTMLElement>('[data-favoritos] .plato').forEach((plato, i) => {
        const foto = plato.querySelector('.plato__foto');
        const precio = plato.querySelector('.precio');
        if (!foto || !precio) return;
        // Estado inicial antes de crear el disparador, para no ver un salto.
        gsap.set(foto, { scale: 0.7, rotation: i % 2 ? 8 : -8, opacity: 0 });
        gsap.set(precio, { scale: 0, rotation: -20 });
        gsap.timeline({ scrollTrigger: { trigger: plato, start: 'top 82%', toggleActions: 'play none none none' } })
            .to(foto, { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.5)', clearProps: 'transform,opacity' })
            .to(precio, { scale: 1, rotation: -3, duration: 0.4, ease: 'back.out(3)' }, '-=0.25');
    });
}

export function recorrerRuta() {
    if (reducido()) return;
    const ruta = document.querySelector<HTMLElement>('.ruta');
    const cabeza = ruta?.querySelector<HTMLElement>('.ruta__cabeza');
    if (!ruta || !cabeza) return;
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('js-ruta');
    const st = { trigger: ruta, start: 'top 70%', end: 'bottom 55%', scrub: 0.5, invalidateOnRefresh: true };
    gsap.fromTo(ruta.querySelector('.ruta__avance'), { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: st });
    gsap.fromTo(cabeza, { y: 0 }, { y: () => ruta.offsetHeight - cabeza.offsetHeight + 4, ease: 'none', scrollTrigger: { ...st } });
}
