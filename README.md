# Математикалық сауаттылық · ҰБТ / ЕНТ

Bilingual (Kazakh and Russian) study site for the math-literacy part of ҰБТ / ЕНТ. It is a client-side app: theory, a 30-question quiz for each of 7 sections, a 5-minute timer on every question, favorites, and an error review. There is no backend.

## Қазақша

ҰБТ-ның математикалық сауаттылық бөліміне арналған оқу сайты. Жеті тақырыптың әрқайсысында қысқа теория және 30 есеп бар. Әр есепке 5 минут беріледі. Тілді («Қаз» / «Рус») және жарық не қараңғы режимді жоғарғы оң жақтан ауыстыруға болады. Таңдау `localStorage` ішінде сақталады.

Іске қосу:

```bash
npm install
npm run dev
```

## Русский

Учебный сайт для математической грамотности ЕНТ. В каждой из семи тем есть краткая теория и 30 задач. На каждую задачу даётся 5 минут. Язык («Қаз» / «Рус») и светлая или тёмная тема переключаются справа сверху и сохраняются в `localStorage`.

Запуск:

```bash
npm install
npm run dev
```

## English

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Check that the question bank is complete and the answer keys match the worked math:

```bash
npm run validate
```

Open the local URL Vite prints (usually `http://localhost:5173`).

### What you can do

- Read rules, formulas, and two worked examples in every subsection.
- Start that section’s 30-question quiz from any of its subsections.
- Confirm one of four options. You cannot go back. If 300 seconds run out, the question is counted as unanswered and the quiz moves on.
- Open a hint, save a question to favorites, then review score, percent, and step-by-step solutions for mistakes.
