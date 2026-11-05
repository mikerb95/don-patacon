/** Validación compartida por publicar y por la vista previa. */
import { DOC_NAMES, docSchemas, type DocName } from '../schema.ts';

export interface Issue {
    /** Ruta del campo: "menu.dishes.3.title". */
    path: string;
    message: string;
}

const MAX_ISSUES = 30;

export function validateDocs(docs: Record<string, unknown>) {
    const issues: Issue[] = [];
    const parsed: Partial<Record<DocName, unknown>> = {};
    for (const name of DOC_NAMES) {
        if (docs[name] === undefined) continue;
        const result = docSchemas[name].safeParse(docs[name]);
        if (result.success) {
            parsed[name] = result.data;
        } else {
            for (const issue of result.error.issues) {
                issues.push({
                    path: [name, ...issue.path.map(String)].join('.'),
                    message: issue.message,
                });
            }
        }
    }
    return { parsed, issues: issues.slice(0, MAX_ISSUES) };
}

/**
 * En la vista previa, las imágenes se piden al panel: una foto recién subida
 * todavía no está en el sitio publicado.
 */
export function rewriteMediaForPreview<T>(value: T): T {
    if (typeof value === 'string') {
        return (value.startsWith('/media/') ? `/api/admin/media/${value.slice(7)}` : value) as T;
    }
    if (Array.isArray(value)) return value.map(rewriteMediaForPreview) as T;
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([k, v]) => [k, rewriteMediaForPreview(v)]),
        ) as T;
    }
    return value;
}
