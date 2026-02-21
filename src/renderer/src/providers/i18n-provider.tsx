import { SETTING_KEYS } from '../../../shared/constants/settings'
import en from '../../../shared/i18n/en'
import type { TranslationKey } from '../../../shared/i18n/keys'
import { api } from '@renderer/lib/api'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

interface I18nContextValue {
  locale: string
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  setLocale: (code: string) => Promise<void>
  reloadTranslations: () => Promise<void>
  isLoading: boolean
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState('en')
  const [translations, setTranslations] = useState<Record<string, string>>({ ...en })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api
      .getSetting(SETTING_KEYS.LANGUAGE)
      .then(async (savedLocale) => {
        const code = savedLocale || 'en'
        setLocaleState(code)
        if (code !== 'en') {
          const trans = await api.getTranslations(code)
          setTranslations(trans)
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let value = translations[key] ?? en[key] ?? key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        }
      }
      return value
    },
    [translations]
  )

  const setLocale = useCallback(async (code: string) => {
    setIsLoading(true)
    try {
      await api.setSetting(SETTING_KEYS.LANGUAGE, code)
      setLocaleState(code)
      const trans = await api.getTranslations(code)
      setTranslations(trans)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reloadTranslations = useCallback(async () => {
    const trans = await api.getTranslations(locale)
    setTranslations(trans)
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, t, setLocale, reloadTranslations, isLoading }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
