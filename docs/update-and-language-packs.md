# Auto-Update & Downloadable Language Packs

## App Auto-Update System

The app uses `electron-updater` with GitHub Releases as the update source. Updates come in two flavors: **force updates** (mandatory) and **optional updates** (dismissable banner).

### Splash Screen Flow

On startup the app shows a splash screen and checks for updates:

1. Splash appears with "Checking for updates..."
2. If a **force update** is detected, the splash shows download progress, installs the update, and restarts the app. The user cannot skip this.
3. If an **optional update** is detected, the splash closes and the main window shows an `UpdateBanner` at the top. The user can download, dismiss, or ignore it.
4. If no update is available, the splash closes and the app loads normally.

### Force vs Optional Updates

Every GitHub Release can embed metadata in the release notes to declare a **minimum version**:

```html
<!--update-meta:{"minVersion":"1.2.0"}-->
```

When the app checks for updates, it parses this comment from the release notes. If the user's current version is below `minVersion`, the update is marked as **forced** -- it downloads and installs during the splash screen with no way to skip.

If the comment is absent or the user's version is at or above `minVersion`, the update is **optional** -- a banner appears in the UI that the user can dismiss.

### GitHub Releases Setup

**1. Configure `electron-builder.yml`**

Replace `YOUR_GITHUB_USER` with your GitHub username:

```yaml
publish:
  provider: github
  owner: your-github-username
  repo: apps_manager
```

**2. Bump the version in `package.json`**

```json
{
  "version": "1.1.0"
}
```

**3. Build and publish**

Set `GH_TOKEN` to a GitHub personal access token with `repo` scope, then build:

```bash
GH_TOKEN=ghp_xxxxxxxxxxxx pnpm build:win --publish always
```

This builds the app, creates the installer, and uploads it as a GitHub Release draft. Go to GitHub and publish the release.

For other platforms:

```bash
GH_TOKEN=ghp_xxxxxxxxxxxx pnpm build:mac --publish always
GH_TOKEN=ghp_xxxxxxxxxxxx pnpm build:linux --publish always
```

**4. Add force-update metadata (optional)**

Edit the release notes on GitHub and include the HTML comment anywhere in the body:

```
## What's new
- Critical security fix

<!--update-meta:{"minVersion":"1.1.0"}-->
```

Any user running a version below `1.1.0` will be forced to update at startup.

---

## Downloadable Language Packs

The i18n system bundles English as the default language. All other languages are downloadable from a dedicated GitHub Release.

### How It Works

- English translations live in `src/shared/i18n/en.ts` and are always available.
- Other languages are JSON files hosted on a GitHub Release tagged `languages-v1`.
- When the user selects a non-English language in Settings > Language, the app downloads the pack if needed, then applies it.
- Missing keys in a downloaded pack fall back to the English value automatically.

### The `languages-v1` Release

All language packs live under a single GitHub Release with the tag `languages-v1`. This release contains:

- `languages-meta.json` -- index of available languages
- `{code}.json` -- one file per language

**`languages-meta.json` format:**

```json
[
  {
    "code": "fr",
    "name": "French",
    "nativeName": "Francais",
    "version": "1.0.0"
  },
  {
    "code": "es",
    "name": "Spanish",
    "nativeName": "Espanol",
    "version": "1.0.0"
  }
]
```

**Individual language file (`fr.json`) format:**

```json
{
  "nav.apps": "Applications",
  "nav.settings": "Parametres",
  "apps.title": "Mes Applications",
  "apps.import": "Importer"
}
```

The keys match `src/shared/i18n/en.ts`. You do not need to translate every key -- any missing key falls back to English.

### Creating the Language Release

**1. Replace `YOUR_GITHUB_USER`**

In `src/main/services/language.service.ts`, update the GitHub API URL:

```typescript
const release = (await fetchJson(
  `https://api.github.com/repos/your-github-username/apps_manager/releases/tags/${LANGUAGES_RELEASE_TAG}`
)) as { assets: { name: string; browser_download_url: string }[] }
```

There are two occurrences of this URL in the file -- update both.

**2. Create the release and upload assets**

```bash
# Create the release (once)
gh release create languages-v1 --title "Language Packs" --notes "Downloadable language packs"

# Upload the meta file and language files
gh release upload languages-v1 languages-meta.json fr.json es.json ja.json
```

**3. Updating language packs**

To update an existing language, bump the `version` in `languages-meta.json`, then re-upload both files:

```bash
# Delete old assets and re-upload
gh release delete-asset languages-v1 fr.json --yes
gh release delete-asset languages-v1 languages-meta.json --yes
gh release upload languages-v1 languages-meta.json fr.json
```

The app detects updates by comparing the installed version (stored in `userData/languages/installed-meta.json`) against the version in `languages-meta.json`. When a newer version is available, the UI shows an "Update available" badge next to the language.

### How `reloadTranslations()` Works

After downloading or updating a language pack, the renderer calls `reloadTranslations()` from the `I18nProvider`. This re-fetches translations from the main process via `window.api.getTranslations(code)`, which reads the JSON file from disk and merges it with English defaults. The UI updates immediately without requiring a restart.

---

## Setup Checklist

Follow these steps for first-time setup:

1. **Replace `YOUR_GITHUB_USER`** in two places:
   - `electron-builder.yml` -- the `owner` field under `publish`
   - `src/main/services/language.service.ts` -- both GitHub API URLs

2. **Set `GH_TOKEN`** environment variable to a GitHub personal access token with `repo` scope.

3. **Bump the version** in `package.json`:

   ```json
   {
     "version": "1.0.0"
   }
   ```

4. **Build and publish the app:**

   ```bash
   GH_TOKEN=ghp_xxxxxxxxxxxx pnpm build:win --publish always
   ```

5. **Create the language packs release:**

   ```bash
   # Prepare your language files
   gh release create languages-v1 --title "Language Packs" --notes "Downloadable language packs"
   gh release upload languages-v1 languages-meta.json fr.json es.json
   ```

6. **Test the update flow** by installing the published version, then bumping the version and publishing again.

---

## Architecture Overview

### Main Process (`src/main/`)

| File                           | Purpose                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `services/updater.service.ts`  | Configures `electron-updater`, checks for updates, parses force-update metadata, downloads and installs updates                       |
| `services/language.service.ts` | Fetches available languages from GitHub, downloads language packs to `userData/languages/`, merges translations with English fallback |
| `ipc/updater.ipc.ts`           | IPC handlers for `updater:check`, `updater:download`, `updater:install`; forwards `download-progress` and status events to renderer   |
| `ipc/language.ipc.ts`          | IPC handlers for `language:get-available`, `language:get-installed`, `language:download`, `language:get-translations`                 |
| `splash.ts`                    | Creates the frameless splash window, provides `updateSplash()` and `closeSplash()` helpers                                            |
| `index.ts`                     | App entry point; orchestrates splash -> update check -> main window creation; registers all IPC handlers                              |

### Preload (`src/preload/`)

| File       | Purpose                                                                                                                                                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.ts` | Exposes `window.api` with updater methods (`checkForUpdate`, `downloadUpdate`, `installUpdate`, `onUpdateStatus`, `onUpdateProgress`) and language methods (`getAvailableLanguages`, `getInstalledLanguages`, `downloadLanguage`, `getTranslations`, `onLanguageProgress`) |

### Renderer (`src/renderer/src/`)

| File                           | Purpose                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `hooks/use-updater.ts`         | Push-based stores via `useSyncExternalStore` for update status and download progress                    |
| `components/update-banner.tsx` | Displays optional update banner with download/install/dismiss actions                                   |
| `providers/i18n-provider.tsx`  | React context providing `t()`, `setLocale()`, and `reloadTranslations()`; loads saved language on mount |
| `hooks/use-languages.ts`       | React Query hooks: `useAvailableLanguages`, `useInstalledLanguages`, `useDownloadLanguage`              |
| `screens/setting/language.tsx` | Settings UI for selecting language, downloading packs, and updating installed packs                     |

### Shared (`src/shared/`)

| File                     | Purpose                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `constants/updater.ts`   | IPC channel names, `UpdateStatus` and `UpdateProgress` types                                |
| `constants/languages.ts` | IPC channel names, `LANGUAGES_RELEASE_TAG` constant (`'languages-v1'`), `LanguageMeta` type |
| `i18n/en.ts`             | English translation strings (the source of truth for all keys)                              |
| `i18n/keys.ts`           | `TranslationKey` type derived from `en.ts`                                                  |
