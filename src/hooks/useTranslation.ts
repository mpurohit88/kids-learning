import { useMemo } from 'react'
import { dataService } from '../data'
import { useAppStore } from '../store/useAppStore'
import { createTranslator, type TranslateFn } from '../utils/translate'
import type { UiLocale } from '../types'

export function useTranslation(): { t: TranslateFn; locale: UiLocale } {
  const locale = useAppStore((state) => state.uiLocale) ?? dataService.getDefaultUiLocale()

  const t = useMemo(
    () =>
      createTranslator(
        dataService.getTranslations(locale),
        dataService.getTranslations(dataService.getDefaultUiLocale()),
      ),
    [locale],
  )

  return { t, locale }
}
