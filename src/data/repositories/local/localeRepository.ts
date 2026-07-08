import type { TranslationDictionary, UiLocale } from '../../../types'
import en from '../../seed/i18n/locales/en.json'
import hi from '../../seed/i18n/locales/hi.json'
import kn from '../../seed/i18n/locales/kn.json'
import {
  DEFAULT_UI_LOCALE,
  MOTHER_TONGUE_LANGUAGES,
  UI_LOCALE_STORAGE_KEY,
} from '../../seed/i18n/languages'
import type { LocaleRepository } from '../types'

const localeMap: Record<UiLocale, TranslationDictionary> = {
  en: en as TranslationDictionary,
  hi: hi as TranslationDictionary,
  kn: kn as TranslationDictionary,
}

function readSavedLocale(): UiLocale | null {
  try {
    const raw = localStorage.getItem(UI_LOCALE_STORAGE_KEY)
    if (!raw) return null
    if (raw in localeMap) return raw as UiLocale
    return null
  } catch {
    return null
  }
}

function writeSavedLocale(locale: UiLocale) {
  localStorage.setItem(UI_LOCALE_STORAGE_KEY, locale)
}

function clearSavedLocaleFromStorage() {
  localStorage.removeItem(UI_LOCALE_STORAGE_KEY)
}

export class LocalLocaleRepository implements LocaleRepository {
  getMotherTongueLanguages() {
    return MOTHER_TONGUE_LANGUAGES
  }

  getDefaultLocale(): UiLocale {
    return DEFAULT_UI_LOCALE
  }

  getTranslations(locale: UiLocale): TranslationDictionary {
    return localeMap[locale] ?? localeMap[DEFAULT_UI_LOCALE]
  }

  getSavedLocale(): UiLocale | null {
    return readSavedLocale()
  }

  saveLocale(locale: UiLocale) {
    writeSavedLocale(locale)
  }

  clearSavedLocale() {
    clearSavedLocaleFromStorage()
  }
}

export { localeMap }
