import type { TranslationDictionary } from '../types'

function getNestedValue(
  dictionary: TranslationDictionary,
  key: string,
): string | undefined {
  const parts = key.split('.')
  let current: TranslationDictionary | string | undefined = dictionary

  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return undefined
    current = current[part] as TranslationDictionary | string | undefined
  }

  return typeof current === 'string' ? current : undefined
}

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template

  return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) => {
    const value = params[token]
    return value === undefined ? `{{${token}}}` : String(value)
  })
}

export function createTranslator(
  dictionary: TranslationDictionary,
  fallbackDictionary?: TranslationDictionary,
) {
  return function translate(
    key: string,
    params?: Record<string, string | number>,
    fallback?: string,
  ): string {
    const value =
      getNestedValue(dictionary, key) ??
      (fallbackDictionary ? getNestedValue(fallbackDictionary, key) : undefined) ??
      fallback ??
      key

    return interpolate(value, params)
  }
}

export type TranslateFn = ReturnType<typeof createTranslator>
