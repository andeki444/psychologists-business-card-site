# Сайт Полины Киселёвой

Статический сайт на GitHub Pages. Репозиторий остаётся на GitHub, а после подключения домена посетители открывают сайт по своему адресу. Отдельный сервер и сборка для публикации не нужны.

[Текущая страница](https://andeki444.github.io/psychologists-business-card-site/)

## Подключение своего домена

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
