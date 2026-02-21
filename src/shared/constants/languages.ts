export const LANGUAGE_CHANNELS = {
  GET_AVAILABLE: 'language:get-available',
  GET_INSTALLED: 'language:get-installed',
  DOWNLOAD: 'language:download',
  UNINSTALL: 'language:uninstall',
  REFRESH: 'language:refresh',
  GET_TRANSLATIONS: 'language:get-translations',
  DOWNLOAD_PROGRESS: 'language:download-progress'
} as const

export const LANGUAGES_RELEASE_TAG = 'languages-v1'

export interface LanguageMeta {
  code: string
  name: string
  nativeName: string
  version: string
}

export interface LanguageProgress {
  code: string
  percent: number
}
