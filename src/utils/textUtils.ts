export function getFirstGrapheme(text: string): string {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
    const first = [...segmenter.segment(text)][0]
    if (first?.segment) return first.segment
  }
  return text.charAt(0)
}
