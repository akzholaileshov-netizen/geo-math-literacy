import type { Visual } from '../types';
import { useI18n } from '../i18n/LanguageContext';

export function VisualBlock({ visual }: { visual: Visual }) {
  const { t } = useI18n();

  if (visual.type === 'table') {
    return (
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[280px] border-collapse text-left text-sm">
          <thead className="bg-brass/10 text-ink">
            <tr>
              {visual.headers.map((header, index) => (
                <th key={index} className="px-3 py-2 font-semibold">
                  {t(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visual.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-line">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2">
                    {t(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (visual.type === 'bar') {
    const max = Math.max(...visual.items.map((item) => item.value), 1);
    return (
      <figure className="rounded-xl border border-line bg-bg/60 p-4">
        <div className="flex h-32 items-end gap-2 sm:gap-3">
          {visual.items.map((item, index) => (
            <div key={index} className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <div className="mb-1 text-center text-xs tabular text-ink">{item.value}</div>
              <div
                className="rounded-t-md bg-brass"
                style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }}
              />
              <div className="mt-2 line-clamp-2 text-center text-xs text-muted">{t(item.label)}</div>
            </div>
          ))}
        </div>
        {visual.unit ? <figcaption className="mt-3 text-xs text-muted">{t(visual.unit)}</figcaption> : null}
      </figure>
    );
  }

  const values = visual.points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 360;
  const height = 160;
  const padX = 28;
  const padY = 18;
  const span = max - min || 1;
  const coords = visual.points.map((point, index) => {
    const x =
      visual.points.length === 1
        ? width / 2
        : padX + (index * (width - padX * 2)) / (visual.points.length - 1);
    const y = padY + (1 - (point.value - min) / span) * (height - padY * 2);
    return { x, y, point };
  });
  const polyline = coords.map((coord) => `${coord.x},${coord.y}`).join(' ');

  return (
    <figure className="rounded-xl border border-line bg-bg/60 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full" role="img">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-brass"
          points={polyline}
        />
        {coords.map((coord, index) => (
          <g key={index}>
            <circle cx={coord.x} cy={coord.y} r="4" className="fill-brass" />
            <text
              x={coord.x}
              y={coord.y - 8}
              textAnchor="middle"
              className="fill-ink text-[10px]"
              fontSize="10"
            >
              {coord.point.value}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-1 grid" style={{ gridTemplateColumns: `repeat(${visual.points.length}, minmax(0, 1fr))` }}>
        {visual.points.map((point, index) => (
          <div key={index} className="truncate text-center text-xs text-muted">
            {t(point.label)}
          </div>
        ))}
      </div>
      {visual.unit ? <figcaption className="mt-2 text-xs text-muted">{t(visual.unit)}</figcaption> : null}
    </figure>
  );
}
