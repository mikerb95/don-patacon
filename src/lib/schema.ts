/**
 * Modelo del contenido del sitio. Los JSON de `content/` se validan con estos
 * esquemas al compilar y cada vez que el panel guarda, así que un dato inválido
 * nunca llega a publicarse.
 */
import { z } from 'astro/zod';

const text = (max: number) => z.string().trim().max(max);

/** Solo http(s): evita enlaces `javascript:` en el sitio público. */
const httpUrl = z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === '' || /^https?:\/\/[^\s]+$/i.test(v), {
        message: 'Debe ser un enlace que empiece por https://',
    });

/** Ruta de una imagen subida desde el panel (vacío = sin imagen). */
export const imagePath = z
    .string()
    .regex(/^$|^\/media\/[a-z0-9-]+\.(webp|jpg|png)$/, 'Imagen inválida');

const id = z.string().regex(/^[a-z0-9-]{1,60}$/, 'Identificador inválido');
const time = z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/, 'Hora inválida');

export const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
export type Day = (typeof DAYS)[number];

const hoursDay = z
    .object({ day: z.enum(DAYS), open: time, close: time })
    .refine((d) => (d.open === '') === (d.close === ''), {
        message: 'Indica la hora de apertura y la de cierre',
    })
    .refine((d) => d.open === '' || d.close > d.open, {
        message: 'El cierre debe ser después de la apertura',
    });

export const businessSchema = z.object({
    name: text(80).min(1, 'El nombre es obligatorio'),
    legalName: text(120),
    nit: text(30),
    mallLocation: text(120),
    address: z.object({
        line1: text(120),
        line2: text(120),
        city: text(60),
        country: text(60),
    }),
    phone: z
        .string()
        .trim()
        .regex(/^$|^[+()\d\s.-]{6,25}$/, 'Teléfono inválido'),
    email: z.union([z.literal(''), z.string().trim().email('Correo inválido').max(120)]),
    whatsapp: z
        .string()
        .transform((v) => {
            const digits = v.replace(/\D/g, '');
            return /^3\d{9}$/.test(digits) ? `57${digits}` : digits;
        })
        .refine((v) => v === '' || /^\d{8,15}$/.test(v), {
            message: 'WhatsApp inválido: escribe el número con indicativo',
        }),
    hours: z.array(hoursDay).length(7),
    delivery: z.object({ rappi: httpUrl, didi: httpUrl }),
    social: z.object({ instagram: httpUrl, facebook: httpUrl, x: httpUrl }),
    mapsUrl: httpUrl,
});

const category = z.object({
    id,
    title: text(60).min(1, 'La categoría necesita un nombre'),
    description: text(400),
    image: imagePath,
});

const dish = z.object({
    id,
    title: text(100).min(1, 'El plato necesita un nombre'),
    description: text(600),
    price: z.number().int('El precio va sin decimales').min(0).max(10_000_000),
    image: imagePath,
    categoryId: id,
    available: z.boolean(),
    specialDays: z.array(z.enum(DAYS)).max(7),
});

export const menuSchema = z
    .object({ categories: z.array(category).max(40), dishes: z.array(dish).max(500) })
    .superRefine((menu, ctx) => {
        const known = new Set(menu.categories.map((c) => c.id));
        const check = (ids: string[], path: string) => {
            const seen = new Set<string>();
            ids.forEach((value, i) => {
                if (seen.has(value)) {
                    ctx.addIssue({ code: 'custom', path: [path, i], message: 'Identificador repetido' });
                }
                seen.add(value);
            });
        };
        check(menu.categories.map((c) => c.id), 'categories');
        check(menu.dishes.map((d) => d.id), 'dishes');
        menu.dishes.forEach((d, i) => {
            if (!known.has(d.categoryId)) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['dishes', i, 'categoryId'],
                    message: `"${d.title}" apunta a una categoría que no existe`,
                });
            }
        });
    });

const textImage = z.object({ text: text(800), image: imagePath });

export const pagesSchema = z.object({
    home: z.object({
        heroTitle: text(60),
        heroImage: imagePath,
        heroDescription: text(500),
        menuTitle: text(80),
        menuDescription: text(400),
        ambienceTitle: text(80),
        ambienceDescription: text(400),
        ambienceItems: z.array(textImage).max(20),
        specialsTitle: text(80),
        specialsDescription: text(400),
        testimonialsTitle: text(80),
        testimonialsDescription: text(400),
        testimonials: z
            .array(z.object({ quote: text(500), author: text(80), avatar: imagePath }))
            .max(30),
    }),
    about: z.object({
        titleTop: text(60),
        titleBottom: text(60),
        subtitle: text(160),
        description: text(1000),
        cover: imagePath,
        blocks: z.array(textImage).max(20),
    }),
    menu: z.object({ title: text(80) }),
    contact: z.object({ title: text(80), description: text(500), howToArrive: text(800) }),
    legal: z.object({
        sections: z.array(z.object({ title: text(120), body: text(10_000) })).max(30),
    }),
});

export type Business = z.infer<typeof businessSchema>;
export type Menu = z.infer<typeof menuSchema>;
export type Category = Menu['categories'][number];
export type Dish = Menu['dishes'][number];
export type Pages = z.infer<typeof pagesSchema>;

export const docSchemas = {
    business: businessSchema,
    menu: menuSchema,
    pages: pagesSchema,
} as const;

export type DocName = keyof typeof docSchemas;
export const DOC_NAMES = Object.keys(docSchemas) as DocName[];
export interface Docs {
    business: Business;
    menu: Menu;
    pages: Pages;
}
