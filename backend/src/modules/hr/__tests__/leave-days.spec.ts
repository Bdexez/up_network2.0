import {
  countWorkingDays,
  easterSunday,
  frenchPublicHolidays,
  isWorkingDay,
} from '../leave-days';

const utc = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe('easterSunday', () => {
  it('retrouve les dimanches de Pâques connus', () => {
    expect(easterSunday(2024).toISOString().slice(0, 10)).toBe('2024-03-31');
    expect(easterSunday(2025).toISOString().slice(0, 10)).toBe('2025-04-20');
    expect(easterSunday(2026).toISOString().slice(0, 10)).toBe('2026-04-05');
  });
});

describe('frenchPublicHolidays', () => {
  it('contient les onze jours fériés légaux', () => {
    expect(frenchPublicHolidays(2026).size).toBe(11);
  });

  it('place les fêtes mobiles à partir de Pâques', () => {
    const holidays = frenchPublicHolidays(2026);
    expect(holidays.has('2026-04-06')).toBe(true); // lundi de Pâques
    expect(holidays.has('2026-05-14')).toBe(true); // Ascension
    expect(holidays.has('2026-05-25')).toBe(true); // lundi de Pentecôte
  });
});

describe('isWorkingDay', () => {
  it('écarte le week-end', () => {
    expect(isWorkingDay(utc('2026-09-12'))).toBe(false); // samedi
    expect(isWorkingDay(utc('2026-09-13'))).toBe(false); // dimanche
    expect(isWorkingDay(utc('2026-09-14'))).toBe(true); // lundi
  });

  it('écarte un jour férié tombant en semaine', () => {
    expect(isWorkingDay(utc('2026-07-14'))).toBe(false);
  });
});

describe('countWorkingDays', () => {
  it('compte les bornes incluses', () => {
    expect(countWorkingDays(utc('2026-09-14'), utc('2026-09-14'))).toBe(1);
  });

  it('retire les week-ends d’une semaine complète', () => {
    expect(countWorkingDays(utc('2026-09-14'), utc('2026-09-20'))).toBe(5);
  });

  it('retire aussi les jours fériés', () => {
    // Semaine du 14 juillet 2026 : le mardi est férié.
    expect(countWorkingDays(utc('2026-07-13'), utc('2026-07-17'))).toBe(4);
  });

  it('traverse une fin d’année', () => {
    // Du jeudi 24 décembre 2026 au vendredi 1er janvier 2027 : Noël et le
    // Jour de l'an sont fériés, le 26 et le 27 tombent en week-end.
    expect(countWorkingDays(utc('2026-12-24'), utc('2027-01-01'))).toBe(5);
  });

  it('renvoie 0 sur une période inversée', () => {
    expect(countWorkingDays(utc('2026-09-20'), utc('2026-09-14'))).toBe(0);
  });

  it('renvoie 0 sur un week-end isolé', () => {
    expect(countWorkingDays(utc('2026-09-12'), utc('2026-09-13'))).toBe(0);
  });
});
