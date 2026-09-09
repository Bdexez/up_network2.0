/**
 * Décompte des jours ouvrés, jours fériés français compris.
 *
 * Isolé et pur : c'est la valeur qui sera décomptée du solde de congés d'un
 * employé, on veut pouvoir la vérifier sans base ni fuseau horaire.
 *
 * Toutes les dates sont manipulées en UTC : les bornes arrivent du client en
 * `YYYY-MM-DD` (donc minuit UTC), et raisonner en heure locale ferait glisser
 * la journée d'un cran une partie de l'année.
 */

const DAY_MS = 86_400_000;

/** Clé « YYYY-MM-DD » d'une date, lue en UTC. */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Dimanche de Pâques, par l'algorithme de Meeus/Jones/Butcher.
 * Trois des onze jours fériés français en découlent.
 */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(Date.UTC(year, month - 1, day));
}

const holidayCache = new Map<number, Set<string>>();

/**
 * Les onze jours fériés légaux en France métropolitaine.
 *
 * Le résultat est mémorisé par année : une demande de congés sur trois
 * semaines interroge le même jeu de dates une quinzaine de fois.
 */
export function frenchPublicHolidays(year: number): Set<string> {
  const cached = holidayCache.get(year);
  if (cached) return cached;

  const easter = easterSunday(year);
  const fromEaster = (offset: number) =>
    dayKey(new Date(easter.getTime() + offset * DAY_MS));

  const holidays = new Set([
    `${year}-01-01`, // Jour de l'an
    fromEaster(1), // Lundi de Pâques
    `${year}-05-01`, // Fête du travail
    `${year}-05-08`, // Victoire 1945
    fromEaster(39), // Ascension
    fromEaster(50), // Lundi de Pentecôte
    `${year}-07-14`, // Fête nationale
    `${year}-08-15`, // Assomption
    `${year}-11-01`, // Toussaint
    `${year}-11-11`, // Armistice 1918
    `${year}-12-25`, // Noël
  ]);

  holidayCache.set(year, holidays);
  return holidays;
}

/** Un samedi, un dimanche ou un jour férié ne se décompte pas. */
export function isWorkingDay(date: Date): boolean {
  const weekday = date.getUTCDay();
  if (weekday === 0 || weekday === 6) return false;
  return !frenchPublicHolidays(date.getUTCFullYear()).has(dayKey(date));
}

/**
 * Jours ouvrés entre deux dates, bornes comprises.
 * Renvoie 0 si la fin précède le début — au service de refuser la demande.
 */
export function countWorkingDays(start: Date, end: Date): number {
  const from = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
  );
  const to = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate(),
  );
  if (to < from) return 0;

  let days = 0;
  for (let time = from; time <= to; time += DAY_MS) {
    if (isWorkingDay(new Date(time))) days += 1;
  }

  return days;
}
