/**
 * Contenido público: se lee de `content/*.json` al compilar. Si un archivo no
 * cumple el esquema, el build falla en vez de publicar una página rota.
 */
import businessJson from '../../content/business.json';
import menuJson from '../../content/menu.json';
import pagesJson from '../../content/pages.json';
import { businessSchema, menuSchema, pagesSchema } from './schema';

export const business = businessSchema.parse(businessJson);
export const menu = menuSchema.parse(menuJson);
export const pages = pagesSchema.parse(pagesJson);

export const content = { business, menu, pages };

export const SITE_DESCRIPTION =
    'DON PATACÓN, cocina colombiana en el Centro Comercial Plaza Central, Bogotá. Pide para recoger o a domicilio.';
