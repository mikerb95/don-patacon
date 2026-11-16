interface Props {
    /** Se conserva por compatibilidad; el arco de la plantilla anterior ya no se dibuja. */
    arc?: boolean;
}

/** Separación entre secciones del inicio (sin adorno: el borde crocante hace ese trabajo). */
const HomeDivider: React.FC<Props> = () => <div aria-hidden="true" className="h-10 lg:h-16" />;

export default HomeDivider;
