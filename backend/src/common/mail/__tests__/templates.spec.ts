import { invoiceEmail, reminderEmail } from '../templates';

const base = {
  companyName: 'DemoCorp',
  partnerName: 'Boulangerie Lefèvre',
  ref: 'FA2026-0001',
  amount: '1 200,00 €',
  dueDate: '15/04/2026',
};

describe('invoiceEmail', () => {
  it('nomme la facture dans l’objet', () => {
    expect(invoiceEmail(base).subject).toBe('Facture FA2026-0001 — DemoCorp');
  });

  it('mentionne le montant et l’échéance', () => {
    const { text } = invoiceEmail(base);
    expect(text).toContain('1 200,00 €');
    expect(text).toContain('15/04/2026');
  });

  it('omet la phrase d’échéance quand il n’y en a pas', () => {
    const { text } = invoiceEmail({ ...base, dueDate: null });
    expect(text).not.toContain('payable au plus tard');
    expect(text).not.toMatch(/\n\n\n/);
  });
});

describe('reminderEmail', () => {
  it('durcit le ton avec le niveau', () => {
    expect(reminderEmail({ ...base, level: 1, daysOverdue: 5 }).text).toContain(
      'Sauf erreur de notre part',
    );
    expect(
      reminderEmail({ ...base, level: 2, daysOverdue: 40 }).text,
    ).toContain('Malgré notre précédent rappel');
    expect(
      reminderEmail({ ...base, level: 3, daysOverdue: 95 }).text,
    ).toContain('En dépit de nos relances');
  });

  it('annonce le recouvrement à partir du troisième rappel', () => {
    expect(
      reminderEmail({ ...base, level: 2, daysOverdue: 40 }).text,
    ).not.toContain('recouvrement');
    expect(
      reminderEmail({ ...base, level: 3, daysOverdue: 95 }).text,
    ).toContain('recouvrement');
  });

  it('rappelle le retard et le montant', () => {
    const { subject, text } = reminderEmail({
      ...base,
      level: 1,
      daysOverdue: 12,
    });
    expect(subject).toBe('Relance 1 — facture FA2026-0001');
    expect(text).toContain('12 jour(s)');
    expect(text).toContain('1 200,00 €');
  });
});
