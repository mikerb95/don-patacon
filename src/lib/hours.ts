/** Horario por día: textos para el sitio, "Abierto ahora" y datos para Google. */
import type { Business, Day } from './schema';

type Hours = Business['hours'];

const LABELS: Record<Day, string> = {
    MON: 'Lun',
    TUE: 'Mar',
    WED: 'Mié',
    THU: 'Jue',
    FRI: 'Vie',
    SAT: 'Sáb',
    SUN: 'Dom',
};

const SCHEMA_DAYS: Record<Day, string> = {
    MON: 'Monday',
    TUE: 'Tuesday',
    WED: 'Wednesday',
    THU: 'Thursday',
    FRI: 'Friday',
    SAT: 'Saturday',
    SUN: 'Sunday',
};

export const hasHours = (hours: Hours) => hours.some((d) => d.open);

/** Agrupa días seguidos con el mismo horario: ["Lun a Vie 12:00 a 20:00"]. */
export function summarizeHours(hours: Hours): string[] {
    if (!hasHours(hours)) return [];
    const groups: { from: Day; to: Day; open: string; close: string }[] = [];
    for (const d of hours) {
        const last = groups[groups.length - 1];
        if (last && last.open === d.open && last.close === d.close) last.to = d.day;
        else groups.push({ from: d.day, to: d.day, open: d.open, close: d.close });
    }
    return groups.map((g) => {
        const days = g.from === g.to ? LABELS[g.from] : `${LABELS[g.from]} a ${LABELS[g.to]}`;
        return g.open ? `${days} ${g.open} a ${g.close}` : `${days} cerrado`;
    });
}

/** Día y hora actuales en Bogotá, sin importar la zona del visitante. */
export function bogotaNow(date = new Date()): { day: Day; time: string } {
    const parts = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: 'America/Bogota',
    }).formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    return {
        day: get('weekday').toUpperCase() as Day,
        time: `${get('hour')}:${get('minute')}`,
    };
}

export function openStatus(hours: Hours, date = new Date()): { open: boolean; label: string } | null {
    if (!hasHours(hours)) return null;
    const { day, time } = bogotaNow(date);
    const today = hours.find((d) => d.day === day);
    if (today?.open && time >= today.open && time < today.close) {
        return { open: true, label: `Abierto hasta las ${today.close}` };
    }
    if (today?.open && time < today.open) {
        return { open: false, label: `Abrimos hoy a las ${today.open}` };
    }
    const start = hours.findIndex((d) => d.day === day);
    for (let i = 1; i <= 7; i++) {
        const next = hours[(start + i) % 7];
        if (next.open) {
            const when = i === 1 ? 'mañana' : `el ${LABELS[next.day].toLowerCase()}`;
            return { open: false, label: `Abrimos ${when} a las ${next.open}` };
        }
    }
    return null;
}

export function openingHoursSpecification(hours: Hours) {
    return hours
        .filter((d) => d.open)
        .map((d) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: SCHEMA_DAYS[d.day],
            opens: d.open,
            closes: d.close,
        }));
}
