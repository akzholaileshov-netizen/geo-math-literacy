# Математикалық сауаттылық · ҰБТ / ЕНТ

Bilingual (Kazakh and Russian) study app for the math-literacy part of ҰБТ / ЕНТ. Seven sections, 30 questions each, a 300-second timer on every question, favorites, a personal dashboard, and a leaderboard.

Everything stays in this browser. Profiles, attempts, progress, and favorites are stored in `localStorage`. There is no account server. A real multi-user leaderboard would need a backend later; today the board is this device's saved students plus 30 demo profiles.

## Қазақша

Жеті тақырыптың әрқайсысында теория және 30 есеп бар. Әр есепке 5 минут (300 секунд). Тіл («Қаз» / «Рус») мен қараңғы/жарық режим жоғарғы оң жақта. Лақап атпен тіркелсеңіз, нәтиже, прогресс және қиын есептер осы браузердің `localStorage` жадында сақталады. Интернетсіз де осы құрылғыда жұмыс істейді. Көшбасшылар тізімінде 30 дайын оқушы бар. Бірнеше адамға ортақ тізім үшін кейін бөлек сервер керек.

Іске қосу:

```bash
npm install
npm run dev
```

Тексеру: `npm test`, `npm run validate`, `npm run build`.

Vercel: Framework **Vite**, build `npm run build`, output `dist`, Node.js **22.x**. Node 20 жаңа деплойда қабылданбайды.

### Ұпай

Дұрыс жауап: **10 + floor(қалған секунд / 30)**, ең көбі 20. Қате және уақыт бітуі: 0. Бір тест ең көбі 600 ұпай. Жұмсалған уақыт: `300 − қалған секунд`.

Көшбасшылар әдепкіде ұпай бойынша (көбі жоғары; тең болса шешілген есеп, содан аз уақыт). Уақыт сұрыптауы жұмсалған секундты көрсетеді (көбі жоғары). Шешілген — дұрыс жауап саны.

## Русский

В каждой из семи тем есть теория и 30 задач. На задачу даётся 5 минут (300 секунд). Язык и тема переключаются справа сверху. После входа по имени результат, прогресс и трудные задачи хранятся в `localStorage` этого браузера и доступны без сети. В таблице лидеров уже есть 30 учебных профилей. Общая таблица для разных людей потребует отдельный сервер позже.

```bash
npm install
npm run dev
```

Проверка: `npm test`, `npm run validate`, `npm run build`.

Vercel: пресет **Vite**, команда `npm run build`, каталог `dist`, Node.js **22.x**. Node 20 для новых деплоев отключён.

### Очки

Верный ответ: **10 + floor(оставшиеся секунды / 30)**, максимум 20. Ошибка и тайм-аут: 0. Максимум за тест — 600. Затраченное время: `300 − оставшиеся секунды`.

Таблица по умолчанию сортируется по очкам (больше выше; при равенстве — больше решённых, затем меньше времени). Сортировка по времени — потраченные секунды (больше выше). По решённым — число верных ответов.

## English

```bash
npm install
npm run dev
```

`npm test` covers scoring and the local store. `npm run validate` checks the 210 answer keys. `npm run build` typechecks and builds. `vercel.json` sets the Vite preset, `npm run build`, and output directory `dist`. The SPA rewrite runs only after static files, so `/assets` is served from `dist`. `engines.node` is `22.x`: Vite 7 needs Node 22.12 or newer, and Vercel rejects Node 20 on new deployments (the current default for a new project is 24.x, which also works).

The app is fully local. Profiles, attempts, per-section progress, and favorites live in `localStorage`, and the leaderboard seeds 30 demo students. Anonymous quizzes create a guest profile that can be claimed with a nickname. Existing `ubt-favorites` entries move into that profile. Sharing one leaderboard across people would need a backend later.

### Points

A correct answer scores `10 + floor(secondsLeft / 30)`, capped by the 300-second clock, so the maximum is 20. A wrong answer or a timeout scores 0. A full quiz is worth at most 600 points. Time spent on a question is `300 - secondsLeft`.

Leaderboard sort:

- **Points** (default): higher points, then more solved, then less time.
- **Time**: more seconds spent, then more points.
- **Solved**: more correct answers, then more points, then less time.
