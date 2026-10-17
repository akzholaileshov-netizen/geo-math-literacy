import { allQuestions, questionsBySection, sections } from '../src/data/catalog';
import type { Question } from '../src/types';

const errors: string[] = [];

function fail(message: string) {
  errors.push(message);
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}

const byId = new Map(allQuestions.map((question) => [question.id, question]));

function text(id: string): string {
  const question = byId.get(id);
  if (!question) {
    fail(`missing ${id}`);
    return '';
  }
  return question.options[question.correctIndex].kk;
}

function expect(id: string, value: string) {
  const got = text(id);
  if (got !== value) fail(`${id}: correct option is "${got}", expected "${value}"`);
}

if (sections.length !== 7) fail(`expected 7 sections, got ${sections.length}`);

const subsectionIds = new Set<string>();
for (const section of sections) {
  if (section.subsections.length !== 3) fail(`${section.id} should have 3 subsections`);
  for (const [lang, title] of [
    ['kk', section.title.kk],
    ['ru', section.title.ru],
  ] as const) {
    if (!title.trim()) fail(`${section.id} empty title ${lang}`);
  }
  if (!section.blurb.kk.trim() || !section.blurb.ru.trim()) fail(`${section.id} empty blurb`);
  for (const subsection of section.subsections) {
    if (subsectionIds.has(subsection.id)) fail(`duplicate subsection ${subsection.id}`);
    subsectionIds.add(subsection.id);
    if (subsection.rules.length < 2) fail(`${subsection.id} needs rules`);
    if (subsection.formulas.length < 1) fail(`${subsection.id} needs formulas`);
    if (subsection.examples.length !== 2) fail(`${subsection.id} needs 2 examples`);
    const blobs = [
      ...subsection.rules,
      ...subsection.formulas,
      ...subsection.examples.flatMap((example) => [example.problem, example.solution]),
    ];
    for (const blob of blobs) {
      if (!blob.kk.trim() || !blob.ru.trim()) fail(`${subsection.id} empty theory string`);
      if (/lorem|placeholder|TODO/i.test(`${blob.kk} ${blob.ru}`)) fail(`${subsection.id} placeholder theory`);
    }
  }
  const questions = questionsBySection[section.id];
  if (!questions || questions.length !== 30) fail(`${section.id} should have 30 questions`);
}

if (allQuestions.length !== 210) fail(`expected 210 questions, got ${allQuestions.length}`);

const ids = new Set<string>();
const promptsKk = new Set<string>();
const promptsRu = new Set<string>();

for (const question of allQuestions) {
  if (ids.has(question.id)) fail(`duplicate id ${question.id}`);
  ids.add(question.id);
  if (promptsKk.has(question.prompt.kk)) fail(`duplicate kk prompt ${question.id}`);
  if (promptsRu.has(question.prompt.ru)) fail(`duplicate ru prompt ${question.id}`);
  promptsKk.add(question.prompt.kk);
  promptsRu.add(question.prompt.ru);
  if (question.prompt.kk === question.prompt.ru) fail(`${question.id} prompt not bilingual`);
  if (question.solution.kk === question.solution.ru) fail(`${question.id} solution text is identical in both languages`);
  if (!question.hint.kk.trim() || !question.hint.ru.trim()) fail(`${question.id} empty hint`);
  if (question.options.length !== 4) fail(`${question.id} needs 4 options`);
  if (question.correctIndex < 0 || question.correctIndex > 3) fail(`${question.id} bad index`);
  const optionKk = question.options.map((option) => option.kk);
  if (new Set(optionKk).size !== 4) fail(`${question.id} duplicate options`);
  for (const option of question.options) {
    if (!option.kk.trim() || !option.ru.trim()) fail(`${question.id} empty option`);
  }
  const joined = `${question.prompt.kk} ${question.prompt.ru} ${question.solution.kk} ${question.solution.ru}`;
  if (/lorem|placeholder|\bTODO\b/i.test(joined)) fail(`${question.id} placeholder`);
}

expect('num-01', '7');
expect('num-02', String(gcd(36, 48)));
expect('num-03', String(lcm(12, 18)));
expect('num-04', String(2 ** 8));
expect('num-05', String(100 % 7));
expect('num-06', '8');
expect('num-07', '9');
expect('num-08', '97');
expect('num-09', '1');
expect('num-10', '234');
expect('num-11', '316');
expect('num-12', String(gcd(84, 126)));
expect('num-13', String(lcm(lcm(8, 12), 18)));
expect('num-14', String(15 * 25));
expect('num-15', String(3 ** 5 + 2 ** 4));
expect('num-16', '143');
expect('num-17', '98');
expect('num-18', String(lcm(lcm(4, 6), 9)));
expect('num-19', '8');
expect('num-20', String(2 ** 10 % 5));
expect('num-21', String(2 + 3 + 5 + 7 + 11));
expect('num-22', '49');
expect('num-23', String((100 * 35) / gcd(100, 35)));
expect('num-24', '17');
expect('num-25', 'Ол 2-ге де, 3-ке де бөлінеді');
expect('num-26', '7');
expect('num-27', String(13 ** 2 - 12 ** 2));
expect('num-28', String(Math.floor(100 / 3)));
expect('num-29', String(gcd(17, 19)));
expect('num-30', String(5 ** 3 * 2 ** 2));

expect('pct-01', String((200 * 15) / 100));
expect('pct-02', '50%');
expect('pct-03', '25%');
expect('pct-04', String(500 * 0.8));
expect('pct-05', String(240 / 8));
expect('pct-06', '15%');
expect('pct-07', String(60 / 0.2));
expect('pct-08', String(200 * 0.3));
expect('pct-09', String(80 * 1.25));
expect('pct-10', String(150 * 0.9));
expect('pct-11', '21%');
expect('pct-12', String(600 / 0.75));
expect('pct-13', String(360 * 0.05));
expect('pct-14', '1');
expect('pct-15', '1 : 2');
expect('pct-16', String((750 * 8) / 100));
expect('pct-17', String(150 / 0.75));
expect('pct-18', String((120 * 35) / 100));
expect('pct-19', '4%');
expect('pct-20', '80%');
expect('pct-21', String((450 * 112) / 100));
expect('pct-22', '20%');
expect('pct-23', '15');
expect('pct-24', String(800 * 0.85));
expect('pct-25', String(70 / 1.4));
expect('pct-26', '25%');
expect('pct-27', String(10000 + 10000 * 0.1 * 2));
expect('pct-28', '500');
expect('pct-29', '30');
expect('pct-30', String((800 * 11 * 9) / 100));

expect('word-01', String(60 * 2.5));
expect('word-02', '3');
expect('word-03', String(300 / (60 + 40)));
expect('word-04', '2');
expect('word-05', '3');
expect('word-06', '42%');
expect('word-07', String(5 * 3 + 15 * 2));
expect('word-08', '3');
expect('word-09', '3');
expect('word-10', '2');
expect('word-11', '2,5');
expect('word-12', String((3 * 4) / 6));
expect('word-13', '200');
expect('word-14', String((2 * 40 * 60) / (40 + 60)));
expect('word-15', String(180 / (12 + 18)));
expect('word-16', '5');
expect('word-17', '6');
expect('word-18', String(120 / (15 + 25)));
expect('word-19', '68%');
expect('word-20', '12');
expect('word-21', '1 сағ 40 мин');
expect('word-22', String((4 * 6) / 3));
expect('word-23', '8,75%');
expect('word-24', '20');
expect('word-25', '15');
expect('word-26', '9');
expect('word-27', '21%');
expect('word-28', '20');
expect('word-29', '1/20');
expect('word-30', String((2 / 5) * 200));

expect('chart-01', 'Марат');
expect('chart-02', String(40 + 55 + 30 + 70));
expect('chart-03', 'сәрсенбі');
expect('chart-04', String(100 - 80));
expect('chart-05', String(10 + 12 + 6 + 2));
expect('chart-06', '2');
expect('chart-07', String(150 - 90));
expect('chart-08', '6');
expect('chart-09', String(20 + 8 - 5 + 3 - 10));
expect('chart-10', '70%');
expect('chart-11', String((2 + 5 + 3 + 4 + 1) / 5));
expect('chart-12', String(9 - 4));
expect('chart-13', String(20 * 450));
expect('chart-14', String(200 * 3 + 350 * 2));
expect('chart-15', String(28 - 21));
expect('chart-16', '11–20');
expect('chart-17', String(60 / 1.5));
expect('chart-18', '2 сағ 30 мин');
expect('chart-19', '40%');
expect('chart-20', '16');
expect('chart-21', '70');
expect('chart-22', '40%');
expect('chart-23', String((10 + 14 + 8 + 12) / 4));
expect('chart-24', '14');
expect('chart-25', String(6 * 2.5));
expect('chart-26', String(32 - 18));
expect('chart-27', '50%');
expect('chart-28', '90%');
expect('chart-29', '2');
expect('chart-30', '25%');

expect('logic-01', '14');
expect('logic-02', '32');
expect('logic-03', '36');
expect('logic-04', '13');
expect('logic-05', '48');
expect('logic-06', '23');
expect('logic-07', '6,25');
expect('logic-08', '14');
expect('logic-09', '42');
expect('logic-10', 'U');
expect('logic-11', 'сенбі');
expect('logic-12', 'Серік');
expect('logic-13', '7');
expect('logic-14', '12');
expect('logic-15', '16');
expect('logic-16', 'А шыншыл, Б өтірікші');
expect('logic-17', '3-қорап');
expect('logic-18', '90°');
expect('logic-19', 'сәрсенбі');
expect('logic-20', '9:05');
expect('logic-21', String(20 + 15 - 8));
expect('logic-22', 'Барлық А элементі С-ға жатады');
expect('logic-23', 'Раушанның тез солатыны міндетті емес');
expect('logic-24', '2');
expect('logic-25', '9');
expect('logic-26', 'шығыс');
expect('logic-27', '11');
expect('logic-28', '12');
expect('logic-29', '80');
expect('logic-30', '63');

expect('geom-01', String(8 * 5));
expect('geom-02', String(2 * (8 + 5)));
expect('geom-03', String(7 * 7));
expect('geom-04', String(9 * 9));
expect('geom-05', String((10 * 6) / 2));
expect('geom-06', '10');
expect('geom-07', '13');
expect('geom-08', '14π');
expect('geom-09', '9π');
expect('geom-10', '70°');
expect('geom-11', '70°');
expect('geom-12', String(9 * 4));
expect('geom-13', String(((6 + 10) / 2) * 5));
expect('geom-14', String(3 ** 3));
expect('geom-15', String(6 * 16));
expect('geom-16', String(2 * 3 * 4));
expect('geom-17', '4');
expect('geom-18', '10');
expect('geom-19', String(18 / 3));
expect('geom-20', String((6 * 8) / 2));
expect('geom-21', '25π');
expect('geom-22', '120°');
expect('geom-23', '72°');
expect('geom-24', '1 : 4');
expect('geom-25', String(12 * 8 - 10 * 6));
expect('geom-26', String((9 * 12) / 2));
expect('geom-27', '14π');
expect('geom-28', '55°');
expect('geom-29', '45π');
expect('geom-30', '12π');

expect('comb-01', String(4 * 3));
expect('comb-02', String(120));
expect('comb-03', String((5 * 4) / 2));
expect('comb-04', String(5 * 4));
expect('comb-05', '1/4');
expect('comb-06', '1/2');
expect('comb-07', '1/3');
expect('comb-08', '3/5');
expect('comb-09', '1/6');
expect('comb-10', String(6));
expect('comb-11', String((6 * 5) / 2));
expect('comb-12', String(99 - 10 + 1));
expect('comb-13', String(120));
expect('comb-14', '3/4');
expect('comb-15', '1/9');
expect('comb-16', '3/5');
expect('comb-17', '3');
expect('comb-18', '0,5');
expect('comb-19', '0,7');
expect('comb-20', '0,2');
expect('comb-21', String(5 * 4 * 3));
expect('comb-22', '1/6');
expect('comb-23', '3/10');
expect('comb-24', String(2 ** 4));
expect('comb-25', String(6));
expect('comb-26', '5/14');
expect('comb-27', String(8 * 7));
expect('comb-28', String(24));
expect('comb-29', '3/8');
expect('comb-30', String((10 * 9 * 8) / 6));

const checked = 210;
if (byId.size !== checked) fail('id map size');

void (0 as unknown as Question);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`OK: ${sections.length} sections, ${subsectionIds.size} subsections, ${allQuestions.length} questions`);
