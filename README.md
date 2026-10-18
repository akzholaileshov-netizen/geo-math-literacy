# Математикалық сауаттылық · ҰБТ / ЕНТ

Bilingual (Kazakh and Russian) study app for the math-literacy part of ҰБТ / ЕНТ. Seven sections, 30 questions each, a 300-second timer on every question, favorites, a personal dashboard, and a leaderboard.

By default everything stays on this device. Supabase is optional.

## Қазақша

Жеті тақырыптың әрқайсысында теория және 30 есеп бар. Әр есепке 5 минут (300 секунд). Тіл («Қаз» / «Рус») мен қараңғы/жарық режим жоғарғы оң жақта. Лақап атпен тіркелсеңіз, нәтиже, прогресс және қиын есептер осы браузерде сақталады. Көшбасшылар тізімінде 30 дайын оқушы бар.

Іске қосу:

```bash
npm install
npm run dev
```

Тексеру: `npm test`, `npm run validate`, `npm run build`.

Vercel: Framework **Vite**, build `npm run build`, output `dist`, Node.js **22.x**. Node 20 жаңа деплойда қабылданбайды. Supabase схемасы жоқ болса, сайт жергілікті режимге түсіп, хабар көрсетеді.

### Ұпай

Дұрыс жауап: **10 + floor(қалған секунд / 30)**, ең көбі 20. Қате және уақыт бітуі: 0. Бір тест ең көбі 600 ұпай. Жұмсалған уақыт: `300 − қалған секунд`.

Көшбасшылар әдепкіде ұпай бойынша (көбі жоғары; тең болса шешілген есеп, содан аз уақыт). Уақыт сұрыптауы жұмсалған секундты көрсетеді (көбі жоғары). Шешілген — дұрыс жауап саны.

### Supabase

1. Жаңа жоба ашып, `supabase/schema.sql` файлын SQL Editor-да орындаңыз. Файлды қайта жіберуге болады. `profiles` кестесі басқа бағандармен бұрыннан бар болса, скрипт `nickname` және `avatar_color` бағандарын қосады.
2. Authentication → Email провайдерін қосыңыз.
3. `.env.example` файлын `.env` етіп көшіріп, `VITE_SUPABASE_URL` және `VITE_SUPABASE_ANON_KEY` мәндерін қойыңыз. Кілттерді git-ке салмаңыз.
4. `npm run dev`. Пошта мен құпия сөз немесе сиқырлы сілтеме жұмыс істейді. Бос `.env` жергілікті режимді қалдырады.

## Русский

В каждой из семи тем есть теория и 30 задач. На задачу даётся 5 минут (300 секунд). Язык и тема переключаются справа сверху. После входа по имени результат, прогресс и трудные задачи хранятся в этом браузере. В таблице лидеров уже есть 30 учебных профилей.

```bash
npm install
npm run dev
```

Проверка: `npm test`, `npm run validate`, `npm run build`.

Vercel: пресет **Vite**, команда `npm run build`, каталог `dist`, Node.js **22.x**. Node 20 для новых деплоев отключён. Если схема Supabase не применена, сайт переходит в локальный режим и показывает сообщение.

### Очки

Верный ответ: **10 + floor(оставшиеся секунды / 30)**, максимум 20. Ошибка и тайм-аут: 0. Максимум за тест — 600. Затраченное время: `300 − оставшиеся секунды`.

Таблица по умолчанию сортируется по очкам (больше выше; при равенстве — больше решённых, затем меньше времени). Сортировка по времени — потраченные секунды (больше выше). По решённым — число верных ответов.

### Supabase

1. Создайте проект и выполните `supabase/schema.sql` в SQL Editor. Файл можно запускать повторно. Если таблица `profiles` уже есть с другими колонками, скрипт добавит `nickname` и `avatar_color`.
2. Включите Email в Authentication.
3. Скопируйте `.env.example` в `.env` и заполните `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`. Не коммитьте ключи.
4. `npm run dev`. Вход почтой и паролем или ссылкой. Пустые переменные оставляют локальный режим.

## English

```bash
npm install
npm run dev
```

`npm test` covers scoring and the local store. `npm run validate` checks the 210 answer keys. `npm run build` typechecks and builds. `vercel.json` sets the Vite preset, `npm run build`, and output directory `dist`. The SPA rewrite runs only after static files, so `/assets` is served from `dist`. `engines.node` is `22.x`: Vite 7 needs Node 22.12 or newer, and Vercel rejects Node 20 on new deployments (the current default for a new project is 24.x, which also works). If the Supabase schema is missing or the client errors, the app falls back to local storage and shows a Kazakh/Russian notice instead of a blank page.

Local mode needs no keys. It keeps profiles, attempts, per-section progress, and favorites in `localStorage`, and seeds 30 demo students. Anonymous quizzes create a guest profile that can be claimed with a nickname. Existing `ubt-favorites` entries move into that profile.

### Points

A correct answer scores `10 + floor(secondsLeft / 30)`, capped by the 300-second clock, so the maximum is 20. A wrong answer or a timeout scores 0. A full quiz is worth at most 600 points. Time spent on a question is `300 - secondsLeft`.

Leaderboard sort:

- **Points** (default): higher points, then more solved, then less time.
- **Time**: more seconds spent, then more points.
- **Solved**: more correct answers, then more points, then less time.

### Supabase

1. Create a project and run `supabase/schema.sql` in the SQL editor. It creates `profiles`, `attempts`, `attempt_answers`, `favorites`, a `section_progress` view, and `leaderboard_rows()`. The file is safe to re-run. If `profiles` already exists with different columns, the script adds `nickname` and `avatar_color` instead of leaving that table unchanged. Row level security lets anyone read the leaderboard aggregates and lets a user write only their own rows. Answer choices stay private.
2. Enable the Email provider under Authentication.
3. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Do not commit real keys.
4. Restart `npm run dev`. The same screens use email and password or a magic link. Leave the variables empty to stay on the local adapter.
