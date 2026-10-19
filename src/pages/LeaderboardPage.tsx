import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buttonClass } from '../components/ui/Button';
import { GlassPanel } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import type { LeaderboardSort, RankedRow } from '../services/ranking';
import { useStore } from '../hooks/StoreContext';
import { useI18n } from '../i18n/LanguageContext';
import { formatDuration } from '../quiz/time';

export function LeaderboardPage() {
  const { m } = useI18n();
  const { store, profile, ready } = useStore();
  const [limit, setLimit] = useState<10 | 50>(10);
  const [sort, setSort] = useState<LeaderboardSort>('points');
  const [rows, setRows] = useState<RankedRow[]>([]);
  const [me, setMe] = useState<RankedRow | null>(null);

  useEffect(() => {
    if (!ready) return;
    let cancel = false;
    void store
      .leaderboard(limit, sort)
      .then((board) => {
        if (cancel) return;
        setRows(board.rows);
        setMe(board.me);
      })
      .catch(() => {
        if (cancel) return;
        setRows([]);
        setMe(null);
      });
    return () => {
      cancel = true;
    };
  }, [limit, ready, sort, store, profile?.id]);

  const meInList = me ? rows.some((row) => row.profileId === me.profileId) : false;
  const labels = { points: m('points'), time: m('timeSpent'), solved: m('solved') };

  return (
    <div className="space-y-6">
      <SectionHeader title={m('leaderboard')} lead={m('pointsInfo')} />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="surface flex flex-wrap rounded-full p-1" role="group" aria-label={m('leaderboard')}>
          <FilterButton active={limit === 10} onClick={() => setLimit(10)} label={m('top10')} />
          <FilterButton active={limit === 50} onClick={() => setLimit(50)} label={m('top50')} />
        </div>
        <div className="surface flex flex-wrap rounded-full p-1" role="group" aria-label={m('sortPoints')}>
          <FilterButton active={sort === 'points'} onClick={() => setSort('points')} label={m('sortPoints')} />
          <FilterButton active={sort === 'time'} onClick={() => setSort('time')} label={m('sortTime')} />
          <FilterButton active={sort === 'solved'} onClick={() => setSort('solved')} label={m('sortSolved')} />
        </div>
      </div>

      <ul className="space-y-2 md:hidden">
        {rows.map((row) => (
          <li key={row.profileId}>
            <RowCard row={row} mine={row.profileId === profile?.id} youLabel={m('you')} guestLabel={m('guest')} labels={labels} />
          </li>
        ))}
      </ul>

      <GlassPanel className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">{m('rank')}</th>
              <th className="px-4 py-3 font-medium">{m('nickname')}</th>
              <th className="px-4 py-3 font-medium">{m('points')}</th>
              <th className="px-4 py-3 font-medium">{m('timeSpent')}</th>
              <th className="px-4 py-3 font-medium">{m('solved')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <Row key={row.profileId} row={row} mine={row.profileId === profile?.id} youLabel={m('you')} guestLabel={m('guest')} />
            ))}
          </tbody>
        </table>
      </GlassPanel>

      {me && !meInList ? (
        <div className="space-y-2">
          <p className="text-sm text-muted">{m('outOfList')}</p>
          <div className="md:hidden">
            <RowCard row={me} mine youLabel={m('you')} guestLabel={m('guest')} labels={labels} />
          </div>
          <GlassPanel className="hidden overflow-x-auto border-brass/50 md:block">
            <table className="w-full text-left text-sm">
              <tbody>
                <Row row={me} mine youLabel={m('you')} guestLabel={m('guest')} />
              </tbody>
            </table>
          </GlassPanel>
        </div>
      ) : null}

      {!profile && ready ? (
        <Link to="/auth" className={buttonClass('primary', 'self-start')}>
          {m('goAuth')}
        </Link>
      ) : null}
    </div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 rounded-full px-3 text-sm ${active ? 'bg-brass text-onbrass shadow-glow' : 'text-muted'}`}
    >
      {label}
    </button>
  );
}

function RowCard({
  row,
  mine,
  youLabel,
  guestLabel,
  labels,
}: {
  row: RankedRow;
  mine: boolean;
  youLabel: string;
  guestLabel: string;
  labels: { points: string; time: string; solved: string };
}) {
  const name = row.isGuest ? guestLabel : row.nickname;
  return (
    <GlassPanel className={`px-4 py-3 ${mine ? 'border-brass/60 bg-brass/10' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 font-medium">
          <span className="mr-2 tabular text-brass">{row.rank}</span>
          <span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ backgroundColor: row.avatarColor }} />
          <span className="break-words">{name}</span>
          {mine ? <span className="ml-2 text-xs font-semibold uppercase tracking-[0.14em] text-brass">{youLabel}</span> : null}
        </p>
      </div>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted">{labels.points}</dt>
          <dd className="tabular">{row.points}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{labels.time}</dt>
          <dd className="tabular">{formatDuration(row.timeSpentSeconds)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{labels.solved}</dt>
          <dd className="tabular">{row.solved}</dd>
        </div>
      </dl>
    </GlassPanel>
  );
}

function Row({
  row,
  mine,
  youLabel,
  guestLabel,
}: {
  row: RankedRow;
  mine: boolean;
  youLabel: string;
  guestLabel: string;
}) {
  const name = row.isGuest ? guestLabel : row.nickname;
  return (
    <tr className={mine ? 'bg-brass/15' : 'border-t border-line'}>
      <td className="px-4 py-3 tabular">{row.rank}</td>
      <td className="px-4 py-3">
        <span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ backgroundColor: row.avatarColor }} />
        {name}
        {mine ? <span className="ml-2 text-xs uppercase tracking-[0.14em] text-brass">{youLabel}</span> : null}
      </td>
      <td className="px-4 py-3 tabular">{row.points}</td>
      <td className="px-4 py-3 tabular">{formatDuration(row.timeSpentSeconds)}</td>
      <td className="px-4 py-3 tabular">{row.solved}</td>
    </tr>
  );
}
