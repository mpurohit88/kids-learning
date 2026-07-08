const STAR_POINTER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23FFEB3B" stroke="%23000" stroke-width="3"/><polygon points="20,7 23.5,16 33,16.5 25.5,22.5 28.5,32 20,26.5 11.5,32 14.5,22.5 7,16.5 16.5,16" fill="%23E040FB" stroke="%23000" stroke-width="2"/><circle cx="20" cy="20" r="4" fill="%23FFFFFF" stroke="%23000" stroke-width="2"/></svg>`

const HAND_POINTER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><path d="M13 7v17l-4-2V13l-4 2v13l2.5 9 8.5 6H30c4.5 0 7-3.5 7-8l-2.5-15-6 2.5V14l-6.5 6.5V7h-9z" fill="%23FFEB3B" stroke="%23000" stroke-width="2.5" stroke-linejoin="round"/></svg>`

const PENCIL_POINTER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M28 6l6 6L14 32l-8 2 2-8L28 6z" fill="%23FFEB3B" stroke="%23000" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 10l6 6" stroke="%23000" stroke-width="2.5" stroke-linecap="round"/><circle cx="10" cy="30" r="5" fill="%23E040FB" stroke="%23000" stroke-width="2"/></svg>`

function toCursorUrl(svg: string, hotspotX: number, hotspotY: number, fallback: string): string {
  return `url("data:image/svg+xml,${svg}") ${hotspotX} ${hotspotY}, ${fallback}`
}

export const ACCESSIBLE_CURSOR_DEFAULT = toCursorUrl(STAR_POINTER_SVG, 20, 20, 'auto')
export const ACCESSIBLE_CURSOR_POINTER = toCursorUrl(HAND_POINTER_SVG, 12, 8, 'pointer')
export const ACCESSIBLE_CURSOR_PENCIL = toCursorUrl(PENCIL_POINTER_SVG, 4, 36, 'crosshair')

export const ACCESSIBLE_EXAM_CURSOR_CLASS = 'accessible-exam-cursor'
