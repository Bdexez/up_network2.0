import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { compactMoney, money, monthLabel } from '../../lib/format';
import type { RevenuePoint } from '../../lib/types';

/**
 * Série unique (chiffre d'affaires mensuel) : pas de légende, le titre de la
 * carte nomme la série. Grille et axes récessifs, survol par repère vertical.
 */
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const points = data.map((point) => ({
    ...point,
    label: monthLabel(point.month),
  }));

  const hasValues = points.some((point) => point.total > 0);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="var(--grid)"
            strokeDasharray="0"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: 'var(--axis)' }}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            dy={4}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={64}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickFormatter={(value: number) => compactMoney(value)}
            domain={hasValues ? undefined : [0, 100]}
          />
          <Tooltip
            cursor={{ stroke: 'var(--axis)', strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-lg border border-line bg-raised px-2.5 py-1.5 shadow-lg">
                  <p className="text-[11px] text-ink-3">{label}</p>
                  <p className="text-sm font-semibold tabular-nums text-ink">
                    {money(payload[0].value as number)}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="linear"
            dataKey="total"
            stroke="var(--series-1)"
            strokeWidth={2}
            fill="url(#revenueFill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)' }}
            dot={false}
            animationDuration={450}
            name="Chiffre d'affaires"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
