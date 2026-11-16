# Сайт Полины Киселёвой

Статический сайт на HTML, CSS и JavaScript. Репозиторий хранится на GitHub. Сайт можно опубликовать на виртуальном хостинге со своим доменом и защитой от DDoS.

[Текущая страница](https://andeki444.github.io/psychologists-business-card-site/)

## Домен и расходы

Цены в Timeweb на 16 ноября 2026 года.

| Домен | Регистрация | Продление |
| --- | ---: | ---: |
| `kiselyeva.ru` | 200 ₽ по акции | 399 ₽/год |
| `kiselyeva.pro` | 580 ₽ по акции | 4 490 ₽/год |

На момент проверки реестры не находили регистрацию обоих имён. Перед оплатой перепроверь доступность и итоговую цену конкретного имени. Другие варианты в .ru — `polinakiselyeva.ru` и `kiselyeva-psy.ru`. [Тарифы и проверка имён в Timeweb](https://timeweb.com/ru/services/domains/)

Для сайта подойдёт обычный виртуальный хостинг. Из показанных на момент проверки тарифов Timeweb Optimo стоил 510 ₽/мес при годовой оплате, или 6 120 ₽/год. Дополнительная защита DDoS-Guard с фильтрацией L3, L4 и L7 стоит от 300 ₽/мес. Вместе это от 810 ₽/мес, или около 9 720 ₽/год плюс домен, если он не входит в пакет. У защиты есть лимит среднего входящего трафика. [Виртуальный хостинг](https://timeweb.com/ru/services/hosting/) · [Условия DDoS-защиты](https://timeweb.com/ru/docs/virtualnyj-hosting/zaschita-ot-ddos/zashchita-ot-ddos-atak/)

## Публикация на виртуальном хостинге

1. Зарегистрируй выбранный домен и оформи виртуальный хостинг. Для регистрации .ru у Timeweb понадобится подтверждение администратора через Госуслуги. [Регистрация и загрузка сайта в Timeweb](https://timeweb.com/ru/community/articles/kak-razmestit-sayt-na-hostinge)
2. В панели хостинга создай сайт, добавь домен в **Домены и SSL** и привяжи его к сайту в разделе **Мои сайты**. Если домен куплен отдельно, примени DNS-записи или NS, которые покажет панель хостинга. Сохрани существующие записи для почты, если она есть.
3. Загрузить нужно готовый `polina-site-for-hosting.zip`. В файловом менеджере распакуй его в `public_html`, чтобы сразу внутри лежали `index.html`, `.htaccess` и `assets`. Убери стандартную страницу-заглушку нового сайта, если хостинг её создал, и удали загруженный ZIP из публичной папки после распаковки. [Файловый менеджер Timeweb](https://timeweb.com/ru/blog/authors/timeweb/articles/chto-takoe-fajlovyj-menedzher/)
4. Выпусти бесплатный SSL-сертификат и включи переадресацию с HTTP на HTTPS в панели. Если нужна дополнительная фильтрация DDoS, подключи её для домена в панели и проверь, что DNS указывает на защищённый IP. Timeweb обновляет записи автоматически при использовании своих NS. [Условия DDoS-защиты](https://timeweb.com/ru/docs/virtualnyj-hosting/zaschita-ot-ddos/zashchita-ot-ddos-atak/)
5. Открой адрес через мобильный интернет и проверь портрет, выбор тем и переход в Telegram. Проверь ответ на документ через `curl.exe -I https://kiselyeva.ru/`, подставив свой домен. На Apache должны быть заголовки `Content-Security-Policy`, `Referrer-Policy` и `X-Frame-Options`. Если заголовков нет, уточни у хостинга, как он обслуживает HTML и применяет `.htaccess`. У Timeweb директивы Apache могут не применяться к ресурсам, которые отдаёт Nginx. [Схема серверов Timeweb](https://timeweb.com/ru/docs/virtualnyj-hosting/obshchaya-informaciya-o-hostinge/osobennosti-tekhnicheskogo-resheniya/)
6. Для печати QR-кода используй рабочий HTTPS-адрес своего домена. Бэкап и исходный репозиторий храни отдельно от `public_html`.

После правок пересобери архив из корня проекта.

```powershell
python deploy/package.py polina-release.zip
```

Политика CSP в `index.html` действует и без настройки сервера. В `deploy/.htaccess` та же политика дополнена запретом встраивания страницы и другими HTTP-заголовками. При изменении списков разрешённых источников обнови оба места.

## Подключение домена к GitHub Pages

1. Зарегистрируй домен. Ниже `example.com` обозначает домен, который ты купишь.
2. В настройках **личного аккаунта GitHub → Pages** добавь домен и подтверди владение. GitHub покажет имя и значение TXT-записи. Добавь её у регистратора, нажми **Verify** и сохрани эту запись после проверки. [Подтверждение домена в GitHub](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
3. В настройках **репозитория → Pages → Custom domain** укажи `example.com` и нажми **Save**. При публикации из ветки GitHub добавит файл `CNAME` в репозиторий. Перед следующими правками подтяни этот коммит. [Настройки Pages этого сайта](https://github.com/andeki444/psychologists-business-card-site/settings/pages)
4. В DNS-зоне у регистратора добавь записи из таблицы. Убери конфликтующие записи для `@` и `www`, которые ведут на старый хостинг или страницу парковки домена. TXT и записи для почты сохрани. [Записи DNS для GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#dns-records-for-your-custom-domain)

| Имя | Тип | Значение |
| --- | --- | --- |
| `@` | `A` | `185.199.108.153` |
| `@` | `A` | `185.199.109.153` |
| `@` | `A` | `185.199.110.153` |
| `@` | `A` | `185.199.111.153` |
| `@` | `AAAA` | `2606:50c0:8000::153` |
| `@` | `AAAA` | `2606:50c0:8001::153` |
| `@` | `AAAA` | `2606:50c0:8002::153` |
| `@` | `AAAA` | `2606:50c0:8003::153` |
| `www` | `CNAME` | `andeki444.github.io` |

5. Когда Pages подтвердит DNS и выдаст сертификат, включи **Enforce HTTPS**. Обновление DNS и выпуск сертификата могут занять до 24 часов. [HTTPS для GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
6. Проверь `https://example.com/` и переход с `www.example.com` на основной адрес. Открой сайт на телефоне через мобильную сеть, проверь фотографии и переход в Telegram. Используй финальный HTTPS-адрес в QR-коде перед печатью.
