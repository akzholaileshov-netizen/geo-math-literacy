import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    void store.leaderboard(limit, sort).then((board) => {
      if (cancel) return;
      setRows(board.rows);
      setMe(board.me);
    });
    return () => {
      cancel = true;
    };
  }, [limit, ready, sort, store, profile?.id]);

  const meInList = me ? rows.some((row) => row.profileId === me.profileId) : false;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-4xl sm:text-5xl">{m('leaderboard')}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{m('pointsInfo')}</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex rounded-full border border-line p-0.5" role="group" aria-label={m('leaderboard')}>
          <FilterButton active={limit === 10} onClick={() => setLimit(10)} label={m('top10')} />
          <FilterButton active={limit === 50} onClick={() => setLimit(50)} label={m('top50')} />
        </div>
        <div className="flex rounded-full border border-line p-0.5" role="group" aria-label={m('sortPoints')}>
          <FilterButton active={sort === 'points'} onClick={() => setSort('points')} label={m('sortPoints')} />
          <FilterButton active={sort === 'time'} onClick={() => setSort('time')} label={m('sortTime')} />
          <FilterButton active={sort === 'solved'} onClick={() => setSort('solved')} label={m('sortSolved')} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-elev shadow-card">
        <table className="w-full min-w-[36rem] text-left text-sm">
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
      </div>

      {me && !meInList ? (
        <div className="space-y-2">
          <p className="text-sm text-muted">{m('outOfList')}</p>
          <div className="overflow-x-auto rounded-2xl border border-brass bg-brass/10">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <tbody>
                <Row row={me} mine youLabel={m('you')} guestLabel={m('guest')} />
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!profile && ready ? (
        <Link to="/auth" className="inline-flex text-brass">
          {m('goAuth')} →
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
      className={`rounded-full px-3 py-1.5 text-sm ${active ? 'bg-brass text-bg' : 'text-muted'}`}
    >
      {label}
    </button>
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
