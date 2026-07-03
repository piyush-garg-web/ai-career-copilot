# Translation Structure

## Provider
The shared translation provider in src/lib/i18n/LanguageProvider.jsx now:
- loads the active locale bundle lazily,
- persists the selected language in local storage and cookies,
- supports interpolation for values like {{count}} and {{name}},
- exposes a translation helper via useTranslation().

## Locale Bundles
- English: src/lib/i18n/locales/en.json
- Hindi: src/lib/i18n/locales/hi.json

## Usage Pattern
Components use the pattern:

```jsx
const { t } = useTranslation();
return <h1>{t("dashboard.welcome.title")}</h1>;
```
