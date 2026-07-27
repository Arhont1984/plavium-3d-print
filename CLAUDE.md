## Проект: 3D Цех — лидогенерация «3D-печать на заказ»

Цель сайта: сбор заявок на 3D-печать технических деталей и художественных фигурок, продвижение
в Яндекс.Поиске. Гео задано как Москва + доставка по всей России (areaServed в схеме включает
и город, и страну) — **точный регион и город не подтверждены пользователем**, уточнить перед
публикацией (см. «Незаполненные места»).

### Дизайн
Тёмный графит (`#14161e`) + фиолетовый акцент (`#7c5cff`, ассоциация с УФ-фотополимером) +
оранжевый акцент (`#ff7a30`, ассоциация с разогретым филаментом FDM). Стиль и структура секций
осознанно скопированы с соседнего проекта `Site_stiralka` (WashFix) — тот же владелец, тот же
паттерн лендинга, для единообразия работы с Claude Code между проектами.

### Стек и почему
Astro (статическая генерация) + Content Layer API (`src/content.config.ts`, коллекция
`portfolio`) — чтобы портфолио пополнялось добавлением markdown-файлов, а не правкой кода.
Node.js и GitHub CLI уже стояли в системе (winget, `C:\Program Files\nodejs`), но не были в PATH
сессии — при работе в новой сессии добавляйте `$env:Path += ";$env:ProgramFiles\nodejs;$env:APPDATA\npm"`
перед `node`/`npm`/`npx`.

### Что уже построено
- Главная (`src/pages/index.astro`) — хиро, буллиты доверия (опыт >1 года, крупные партии,
  2 типа принтеров, макс. размер детали), блок услуг (2 карточки), блок оборудования,
  блок «крупные партии» для B2B, тизер портфолио (3 featured-кейса), форма заявки, FAQ
  (микроразметка Schema.org `FAQPage`).
- Страницы услуг: `/uslugi/tehnicheskie-detali/` и `/uslugi/hudozhestvennye-figurki/` —
  раскрывают каждое направление отдельно для более широкого охвата поисковых запросов.
- `/oborudovanie/` — сравнение FDM и фотополимера (таблица + карточки), закрывает
  информационные запросы вида «FDM или фотополимер что лучше».
- Портфолио: `src/content/portfolio/*.md` (Content Layer API, `glob`-загрузчик) →
  `/portfolio/` (лента-грид) и `/portfolio/[id]/` (страница кейса, рендерит markdown-тело).
  Схема коллекции в `src/content.config.ts`: `title`, `client`, `date`, `category`
  (`tehnika`/`figurki`), `printerType` (`fdm`/`photopolymer`/`both`), `summary`, `cover`,
  `images[]`, `tags[]`, `featured`, `draft`.
- 3 карточки-заготовки с `draft: true` (бейдж «Черновик» на сайте): `sberbank.md` (реальный
  клиент, названный пользователем — специально оставлен как шаблон с инструкцией, а не
  заполнен придуманными подробностями, т.к. реальные детали заказа не были предоставлены),
  `tehnicheskiy-prototip.md` и `figurki-partiya.md` (общие примеры-заготовки для демонстрации
  формата ленты). **Прежде чем публиковать сайт — замените все три на реальные кейсы с фото.**
- `src/components/LeadForm.astro` — Имя + переключатель Телефон/Telegram/WhatsApp/Email,
  необязательное поле «что печатаем», чекбокс согласия, honeypot.
- Политика конфиденциальности (152-ФЗ, черновик — требует юридической проверки перед публикацией).
- SEO-инфраструктура в `src/layouts/BaseLayout.astro` — canonical, OG-теги, Schema.org
  `LocalBusiness`, автогенерация sitemap (`@astrojs/sitemap`), `public/robots.txt`.
- `src/lib/url.ts` — хелпер для внутренних ссылок с учётом `base` (нужен из-за потенциального
  временного деплоя на GitHub Pages по подпути, как в WashFix).

### Незаполненные места — обязательно доделать перед реальным запуском
1. **Регион и охват** — не подтверждён пользователем. Сейчас в `BaseLayout.astro`
   `areaServed` указывает и Москву (город), и Россию (страна) как компромисс. Уточните
   у владельца: только Москва (самовывоз/локальная доставка) или вся Россия (пересылка ТК) —
   от этого зависит гео-SEO стратегия (нужны ли гео-страницы районов/городов по аналогии
   с `Site_stiralka/src/pages/rayony/`).
2. `src/data/site.ts` — реквизиты-заглушки: телефон, email, ИНН, ОГРНИП, юрлицо, домен,
   Telegram/WhatsApp. Заменить на реальные данные.
3. Портфолио — все 3 кейса черновики (см. выше). Реальные фото положить в
   `public/portfolio/<slug>/`, пути указать в frontmatter (`cover`, `images`), снять `draft`.
4. Форма заявки — фронтенд-заглушка (показывает «Заявка принята», никуда не отправляет).
   Нужен бэкенд/интеграция (Telegram-бот, amoCRM/Bitrix24, Formspree) — отложено до выбора
   хостинга, как и в WashFix.
5. Фото цеха/принтеров/готовых изделий — везде плейсхолдеры с пунктирной рамкой.
6. Домен/хостинг не выбраны — `astro.config.mjs` использует placeholder `https://3dtseh.ru`.
7. `og-cover.jpg` — путь указан в схеме `LocalBusiness`, но файла нет в `public/` — добавить,
   когда появится изображение для соцсетей.
8. GitHub-репозиторий и деплой-превью — **не созданы**. Пользователь не подтвердил, нужен ли
   временный публичный деплой на GitHub Pages (как у WashFix); workflow
   (`.github/workflows/deploy.yml`) уже готов и заработает сразу после `git push`, если
   репозиторий будет создан и `base`/`site` в `astro.config.mjs` поправлены под его имя.

### Приоритеты по контенту для SEO (по аналогии с опытом WashFix)
1. **Портфолио с реальными фото** — сейчас главный пробел; для 3D-печати визуальное
   доказательство качества решает больше, чем текст.
2. **Гео-стратегия** — после уточнения региона решить, нужны ли отдельные страницы под города
   доставки или локальный SEO ограничивается Москвой.
3. **Материалы печати** — потенциальный источник трафика: отдельные страницы/блок про
   PLA/PETG/ABS/нейлон и типы смол, если объём запросов оправдает.
4. **Отзывы** — раздела пока нет, критично для доверия в B2B-заявках (крупные партии).
5. **Полный прайс-лист** — сейчас цены нигде не указаны (в отличие от WashFix), т.к. цена на
   печать сильно зависит от модели/материала/тиража — обсудить с пользователем, нужен ли
   калькулятор или ориентировочная сетка цен.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
