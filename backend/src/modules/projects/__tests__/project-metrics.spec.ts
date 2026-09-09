import { computeProjectMetrics } from '../project-metrics';

const entry = (hours: number, billable = true, invoicedHours = 0) => ({
  hours,
  billable,
  invoicedHours,
});

describe('computeProjectMetrics', () => {
  it('additionne les heures et distingue le facturable', () => {
    const metrics = computeProjectMetrics(
      [entry(3), entry(2), entry(4, false)],
      { budgetHours: 0, hourlyRate: 100 },
    );

    expect(metrics.totalHours).toBe(9);
    expect(metrics.billableHours).toBe(5);
  });

  it('valorise le reste à facturer', () => {
    const metrics = computeProjectMetrics(
      [entry(10, true, 4), entry(5, true, 0)],
      { budgetHours: 0, hourlyRate: 80 },
    );

    expect(metrics.invoicedHours).toBe(4);
    expect(metrics.pendingHours).toBe(11);
    expect(metrics.pendingAmount).toBe(880);
  });

  it('ne compte pas les heures non facturables comme facturées', () => {
    const metrics = computeProjectMetrics([entry(8, false, 0)], {
      budgetHours: 0,
      hourlyRate: 100,
    });
    expect(metrics.billableHours).toBe(0);
    expect(metrics.pendingAmount).toBe(0);
  });

  it('calcule la consommation du budget', () => {
    const metrics = computeProjectMetrics([entry(30)], {
      budgetHours: 40,
      hourlyRate: 0,
    });
    expect(metrics.budgetUsedPercent).toBe(75);
    expect(metrics.overBudget).toBe(false);
  });

  it('signale un dépassement de budget', () => {
    const metrics = computeProjectMetrics([entry(50)], {
      budgetHours: 40,
      hourlyRate: 0,
    });
    expect(metrics.budgetUsedPercent).toBe(125);
    expect(metrics.overBudget).toBe(true);
  });

  it('traite un budget nul comme « non suivi »', () => {
    // Piège : `totalHours / 0` donnerait Infinity, et `> 0` marquerait
    // le projet en dépassement dès la première heure saisie.
    const metrics = computeProjectMetrics([entry(12)], {
      budgetHours: 0,
      hourlyRate: 0,
    });
    expect(metrics.budgetUsedPercent).toBeNull();
    expect(metrics.overBudget).toBe(false);
  });

  it('ne rend jamais un reste à facturer négatif', () => {
    const metrics = computeProjectMetrics([entry(5, true, 8)], {
      budgetHours: 0,
      hourlyRate: 100,
    });
    expect(metrics.pendingHours).toBe(0);
    expect(metrics.pendingAmount).toBe(0);
  });

  it('rend des métriques nulles sans saisie', () => {
    expect(
      computeProjectMetrics([], { budgetHours: 10, hourlyRate: 100 }),
    ).toMatchObject({ totalHours: 0, budgetUsedPercent: 0, overBudget: false });
  });
});
