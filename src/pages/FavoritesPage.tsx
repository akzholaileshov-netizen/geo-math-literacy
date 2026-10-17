import { Link } from 'react-router-dom';
import { VisualBlock } from '../components/VisualBlock';
import { questionById } from '../data/catalog';
import { useFavorites } from '../favorites/useFavorites';
import { useI18n } from '../i18n/LanguageContext';

export function FavoritesPage() {
  const { ids, remove } = useFavorites();
  const { t, m } = useI18n();
  const questions = ids.map((id) => questionById.get(id)).filter((item) => item !== undefined);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-4xl sm:text-5xl">{m('favorites')}</h1>
      </header>
      {questions.length === 0 ? (
        <div className="rounded-2xl border border-line bg-elev p-6">
          <p className="text-muted">{m('emptyFav')}</p>
          <Link to="/" className="mt-4 inline-flex text-brass">
            {m('toSections')} →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <article key={question.id} className="rounded-2xl border border-line bg-elev p-5 shadow-card sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-serif text-2xl leading-snug">{t(question.prompt)}</h2>
                <button
                  type="button"
                  onClick={() => remove(question.id)}
                  className="shrink-0 rounded-full border border-line px-3 py-1 text-sm hover:border-bad hover:text-bad"
                >
                  {m('remove')}
                </button>
              </div>
              {question.visual ? (
                <div className="mt-4">
                  <VisualBlock visual={question.visual} />
                </div>
              ) : null}
              <ol className="mt-4 space-y-1 text-sm">
                {question.options.map((option, index) => (
                  <li key={index} className={index === question.correctIndex ? 'text-good' : 'text-muted'}>
                    {String.fromCharCode(65 + index)}. {t(option)}
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-sm text-muted">
                {m('hint')}: {t(question.hint)}
              </p>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed">{t(question.solution)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
